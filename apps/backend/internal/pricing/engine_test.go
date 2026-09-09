package pricing

import (
	"testing"

	"github.com/examen-ecommerce/backend/internal/core/domain"
)

func priced(id domain.ProductID, category domain.Category, unitPrice domain.Cents, quantity int) domain.PricedItem {
	return domain.PricedItem{
		ProductID:  id,
		Category:   category,
		UnitPrice:  unitPrice,
		Quantity:   quantity,
		LineAmount: unitPrice * domain.Cents(quantity),
	}
}

func omittedCoupon() domain.CouponResult {
	return domain.CouponResult{Status: domain.CouponOmitted}
}

func appliedCoupon() domain.CouponResult {
	return domain.CouponResult{Code: "WELCOME2026", Status: domain.CouponApplied}
}

func notFoundCoupon() domain.CouponResult {
	return domain.CouponResult{Code: "BOGUS", Status: domain.CouponNotFound}
}

func expiredCoupon() domain.CouponResult {
	return domain.CouponResult{Code: "WELCOME2026", Status: domain.CouponExpired}
}

func TestEngine_EmptyCart(t *testing.T) {
	breakdown := NewEngine().Calculate(nil, omittedCoupon())

	if breakdown.OriginalSubtotal != 0 || breakdown.FinalTotal != 0 {
		t.Fatalf("expected zeroed breakdown, got %+v", breakdown)
	}
	if breakdown.EffectiveDiscountPercentage != 0 {
		t.Fatalf("expected 0%% effective discount for empty cart, got %v", breakdown.EffectiveDiscountPercentage)
	}
	if breakdown.LimitApplied {
		t.Fatal("limit must never apply to an empty cart")
	}
}

// PA-01: non-technology product, below the volume threshold, no coupon.
func TestEngine_PA01_NoDiscountsApplicable(t *testing.T) {
	items := []domain.PricedItem{priced("home-001", domain.CategoryHome, 5000, 1)}
	breakdown := NewEngine().Calculate(items, omittedCoupon())

	if breakdown.CategoryDiscount != 0 || breakdown.VolumeDiscount != 0 || breakdown.CouponDiscount != 0 {
		t.Fatalf("expected no discounts, got %+v", breakdown)
	}
	if breakdown.FinalTotal != 5000 {
		t.Fatalf("expected final total 5000, got %d", breakdown.FinalTotal)
	}
}

// PA-02: technology product only, no coupon -> exactly 10% off.
func TestEngine_PA02_OnlyCategoryDiscount(t *testing.T) {
	items := []domain.PricedItem{priced("tech-001", domain.CategoryTechnology, 5000, 1)}
	breakdown := NewEngine().Calculate(items, omittedCoupon())

	if breakdown.CategoryDiscount != 500 {
		t.Fatalf("expected categoryDiscount 500, got %d", breakdown.CategoryDiscount)
	}
	if breakdown.AfterCategory != 4500 {
		t.Fatalf("expected afterCategory 4500, got %d", breakdown.AfterCategory)
	}
	if breakdown.VolumeDiscount != 0 {
		t.Fatalf("expected no volume discount below threshold, got %d", breakdown.VolumeDiscount)
	}
}

// A cart mixing technology and non-technology lines: category discount
// must only ever reduce the technology subtotal.
func TestEngine_MixedCartOnlyDiscountsTechnologyLines(t *testing.T) {
	items := []domain.PricedItem{
		priced("tech-001", domain.CategoryTechnology, 10000, 1),
		priced("home-001", domain.CategoryHome, 5000, 1),
	}
	breakdown := NewEngine().Calculate(items, omittedCoupon())

	if breakdown.CategoryDiscount != 1000 {
		t.Fatalf("expected categoryDiscount 1000 (10%% of 10000 tech only), got %d", breakdown.CategoryDiscount)
	}
}

// PA-03: afterCategory exactly USD 100.00 must not trigger volume.
func TestEngine_PA03_ExactVolumeThresholdDoesNotApply(t *testing.T) {
	items := []domain.PricedItem{priced("home-001", domain.CategoryHome, 10000, 1)} // no category discount, afterCategory=10000
	breakdown := NewEngine().Calculate(items, omittedCoupon())

	if breakdown.AfterCategory != 10000 {
		t.Fatalf("expected afterCategory 10000, got %d", breakdown.AfterCategory)
	}
	if breakdown.VolumeDiscount != 0 {
		t.Fatalf("expected no volume discount at the exact threshold, got %d", breakdown.VolumeDiscount)
	}
}

// PA-04: afterCategory of USD 100.01 must trigger the 5% volume discount.
func TestEngine_PA04_JustAboveVolumeThresholdApplies(t *testing.T) {
	items := []domain.PricedItem{priced("home-001", domain.CategoryHome, 10001, 1)}
	breakdown := NewEngine().Calculate(items, omittedCoupon())

	if breakdown.VolumeDiscount == 0 {
		t.Fatal("expected volume discount to apply just above the threshold")
	}
}

// PA-05: coupon-only discount, below the volume threshold and no tech items.
func TestEngine_PA05_OnlyCouponDiscount(t *testing.T) {
	items := []domain.PricedItem{priced("home-001", domain.CategoryHome, 5000, 1)}
	breakdown := NewEngine().Calculate(items, appliedCoupon())

	if breakdown.CategoryDiscount != 0 || breakdown.VolumeDiscount != 0 {
		t.Fatalf("expected no category/volume discount, got %+v", breakdown)
	}
	if breakdown.CouponDiscount != 750 { // 15% of 5000
		t.Fatalf("expected couponDiscount 750, got %d", breakdown.CouponDiscount)
	}
}

// PA-06/PA-07: an unresolved coupon never produces a discount, but the
// other rules must still apply.
func TestEngine_PA06PA07_RejectedCouponYieldsZeroCouponDiscount(t *testing.T) {
	for _, coupon := range []domain.CouponResult{notFoundCoupon(), expiredCoupon()} {
		items := []domain.PricedItem{priced("tech-001", domain.CategoryTechnology, 12000, 1)}
		breakdown := NewEngine().Calculate(items, coupon)

		if breakdown.CouponDiscount != 0 {
			t.Fatalf("expected couponDiscount 0 for status %s, got %d", coupon.Status, breakdown.CouponDiscount)
		}
		if breakdown.CategoryDiscount == 0 {
			t.Fatalf("expected category discount to still apply for status %s", coupon.Status)
		}
	}
}

// PA-08: the reference example from product-specification.md — a single
// USD 120.00 technology product with WELCOME2026 applied.
func TestEngine_PA08_ReferenceExampleFromSpec(t *testing.T) {
	items := []domain.PricedItem{priced("tech-001", domain.CategoryTechnology, 12000, 1)}
	breakdown := NewEngine().Calculate(items, appliedCoupon())

	want := domain.PricingBreakdown{
		OriginalSubtotal:            12000,
		CategoryDiscount:            1200,
		AfterCategory:               10800,
		VolumeDiscount:              540,
		AfterVolume:                 10260,
		CouponDiscount:              1539,
		CalculatedSavings:           3279,
		MaximumSavings:              4200,
		FinalSavings:                3279,
		EffectiveDiscountPercentage: 27.325,
		LimitApplied:                false,
		FinalTotal:                  8721,
		Currency:                    domain.CurrencyUSD,
	}

	if breakdown != want {
		t.Fatalf("breakdown mismatch:\n got  %+v\n want %+v", breakdown, want)
	}
}

// Invariants that must hold for every valid cart, per backend-specification.md #7.2.
func TestEngine_Invariants_MonotonicAndBounded(t *testing.T) {
	items := []domain.PricedItem{priced("tech-001", domain.CategoryTechnology, 12000, 1)}
	breakdown := NewEngine().Calculate(items, appliedCoupon())

	if breakdown.AfterCategory > breakdown.OriginalSubtotal {
		t.Fatal("afterCategory must not exceed originalSubtotal")
	}
	if breakdown.AfterVolume > breakdown.AfterCategory {
		t.Fatal("afterVolume must not exceed afterCategory")
	}
	if breakdown.FinalSavings > breakdown.MaximumSavings {
		t.Fatal("finalSavings must never exceed maximumSavings")
	}
	if breakdown.FinalTotal != breakdown.OriginalSubtotal-breakdown.FinalSavings {
		t.Fatal("finalTotal must equal originalSubtotal - finalSavings")
	}
	if breakdown.FinalTotal < 0 {
		t.Fatal("finalTotal must never be negative")
	}
}

// DR-01: with production percentages the cap can never trigger, but the
// mechanism itself must be verifiable via a controlled low percentage.
func TestCapRule_TruncatesWhenCalculatedSavingsExceedMaximum(t *testing.T) {
	ctx := PricingContext{OriginalSubtotal: 10000}
	cap := CapRule{MaxPercent: 5} // force calculatedSavings (3279-ish) > max

	result := cap.Apply(ctx, 6000) // calculatedTotal=6000 => calculatedSavings=4000 > max(500)

	if result.Total != 9500 { // originalSubtotal - maximumSavings(500)
		t.Fatalf("expected truncated total 9500, got %d", result.Total)
	}
}

func TestCapRule_DoesNotTruncateBelowLimit(t *testing.T) {
	ctx := PricingContext{OriginalSubtotal: 10000}
	cap := CapRule{MaxPercent: 50}

	result := cap.Apply(ctx, 9000) // calculatedSavings=1000 <= max(5000)

	if result.Total != 9000 {
		t.Fatalf("expected untruncated total 9000, got %d", result.Total)
	}
}
