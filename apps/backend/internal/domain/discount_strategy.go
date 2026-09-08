package domain

// DiscountStrategy defines the contract for a single discount rule
// applied sequentially during order processing (Strategy pattern).
type DiscountStrategy interface {
	Apply(amount float64) (discountedAmount float64, discountApplied float64)
	Name() string
}

// DiscountEngine composes multiple DiscountStrategy implementations
// and enforces aggregate constraints (e.g. a maximum total discount).
type DiscountEngine interface {
	AddStrategy(strategy DiscountStrategy)
	CalculateFinalAmount(originalAmount float64) DiscountResult
}

// DiscountResult represents the breakdown of applied discounts.
type DiscountResult struct {
	OriginalAmount    float64
	FinalAmount       float64
	TotalDiscount     float64
	DiscountPercent   float64
	AppliedStrategies []string
}
