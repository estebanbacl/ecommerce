package pricing

import "github.com/examen-ecommerce/backend/internal/core/domain"

// Engine runs an ordered, deterministic pipeline of DiscountRule
// (a Chain of Responsibility over Strategy implementations) and produces
// the authoritative domain.PricingBreakdown. It is pure: no persistence,
// no clock, no I/O.
type Engine struct {
	category CategoryRule
	volume   VolumeRule
	coupon   CouponRule
	cap      CapRule
}

func NewEngine() Engine {
	return Engine{
		category: NewCategoryDiscountRule(),
		volume:   NewVolumeDiscountRule(),
		coupon:   NewCouponDiscountRule(),
		cap:      NewMaximumDiscountCapRule(),
	}
}

func (e Engine) Calculate(items []domain.PricedItem, coupon domain.CouponResult) domain.PricingBreakdown {
	var originalSubtotal domain.Cents
	for _, item := range items {
		originalSubtotal += item.LineAmount
	}

	ctx := PricingContext{
		Items:            items,
		OriginalSubtotal: originalSubtotal,
		Coupon:           coupon,
	}

	categoryResult := e.category.Apply(ctx, originalSubtotal)
	afterCategory := categoryResult.Total

	volumeResult := e.volume.Apply(ctx, afterCategory)
	afterVolume := volumeResult.Total

	couponResult := e.coupon.Apply(ctx, afterVolume)
	calculatedTotal := couponResult.Total

	calculatedSavings := originalSubtotal - calculatedTotal
	maximumSavings := domain.RoundHalfUpPercent(originalSubtotal, e.cap.MaxPercent)

	capResult := e.cap.Apply(ctx, calculatedTotal)
	finalTotal := capResult.Total
	finalSavings := originalSubtotal - finalTotal

	var effectiveDiscountPercentage float64
	if originalSubtotal > 0 {
		effectiveDiscountPercentage = float64(finalSavings) / float64(originalSubtotal) * 100
	}

	return domain.PricingBreakdown{
		OriginalSubtotal:            originalSubtotal,
		CategoryDiscount:            categoryResult.Discount,
		AfterCategory:               afterCategory,
		VolumeDiscount:              volumeResult.Discount,
		AfterVolume:                 afterVolume,
		CouponDiscount:              couponResult.Discount,
		CalculatedSavings:           calculatedSavings,
		MaximumSavings:              maximumSavings,
		FinalSavings:                finalSavings,
		EffectiveDiscountPercentage: effectiveDiscountPercentage,
		LimitApplied:                calculatedSavings > maximumSavings,
		FinalTotal:                  finalTotal,
		Currency:                    domain.CurrencyUSD,
	}
}
