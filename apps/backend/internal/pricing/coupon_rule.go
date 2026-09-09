package pricing

import "github.com/examen-ecommerce/backend/internal/core/domain"

const CouponRuleCode = "WELCOME2026_15_PERCENT"

// CouponRule discounts 15% off the running total, only when the coupon
// resolved to domain.CouponApplied. Resolution happens before pricing;
// this rule only reacts to the already-resolved status.
type CouponRule struct {
	Percent int64
}

func NewCouponDiscountRule() CouponRule {
	return CouponRule{Percent: 15}
}

func (r CouponRule) Code() string { return CouponRuleCode }

func (r CouponRule) Apply(ctx PricingContext, current domain.Cents) RuleResult {
	if ctx.Coupon.Status != domain.CouponApplied {
		return RuleResult{Discount: 0, Total: current}
	}

	discount := domain.RoundHalfUpPercent(current, r.Percent)
	return RuleResult{Discount: discount, Total: current - discount}
}
