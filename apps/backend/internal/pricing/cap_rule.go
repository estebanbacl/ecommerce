package pricing

import "github.com/examen-ecommerce/backend/internal/core/domain"

const CapRuleCode = "MAXIMUM_DISCOUNT_35_PERCENT"

// CapRule enforces that the total savings across the whole pipeline never
// exceed a configured percentage of the original subtotal. With the
// production percentages (10/5/15) the maximum reachable discount is
// 27.325%, so this rule can never trigger in production data — see
// DR-01 in docs/specs/product-specification.md. It is still implemented
// and unit tested against a configurable percentage so the behaviour is
// verifiable without silently changing production rules.
type CapRule struct {
	MaxPercent int64
}

func NewMaximumDiscountCapRule() CapRule {
	return CapRule{MaxPercent: 35}
}

func (r CapRule) Code() string { return CapRuleCode }

func (r CapRule) Apply(ctx PricingContext, current domain.Cents) RuleResult {
	calculatedSavings := ctx.OriginalSubtotal - current
	maximumSavings := domain.RoundHalfUpPercent(ctx.OriginalSubtotal, r.MaxPercent)
	finalSavings := domain.MinCents(calculatedSavings, maximumSavings)

	finalTotal := ctx.OriginalSubtotal - finalSavings
	appliedCapDiscount := finalTotal - current // negative-or-zero adjustment
	return RuleResult{Discount: -appliedCapDiscount, Total: finalTotal}
}
