package pricing

import "github.com/examen-ecommerce/backend/internal/core/domain"

// PricingContext carries the read-only information a DiscountRule needs
// to decide its own contribution. Rules never mutate items or stock.
type PricingContext struct {
	Items            []domain.PricedItem
	OriginalSubtotal domain.Cents
	Coupon           domain.CouponResult
}

// RuleResult is what a single DiscountRule contributes to the pipeline.
type RuleResult struct {
	Discount domain.Cents
	Total    domain.Cents
}

// DiscountRule is the Strategy interface: each concrete rule encapsulates
// one discount algorithm and can be swapped independently of the engine
// that sequences them.
type DiscountRule interface {
	Code() string
	Apply(ctx PricingContext, current domain.Cents) RuleResult
}
