package pricing

import "github.com/examen-ecommerce/backend/internal/core/domain"

const VolumeRuleCode = "VOLUME_5_PERCENT"

// VolumeRule discounts 5% off the running total, strictly above a threshold.
type VolumeRule struct {
	Percent   int64
	Threshold domain.Cents
}

func NewVolumeDiscountRule() VolumeRule {
	return VolumeRule{Percent: 5, Threshold: 10000} // USD 100.00
}

func (r VolumeRule) Code() string { return VolumeRuleCode }

func (r VolumeRule) Apply(_ PricingContext, current domain.Cents) RuleResult {
	if current <= r.Threshold {
		return RuleResult{Discount: 0, Total: current}
	}

	discount := domain.RoundHalfUpPercent(current, r.Percent)
	return RuleResult{Discount: discount, Total: current - discount}
}
