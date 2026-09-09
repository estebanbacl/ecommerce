package domain

// PricingBreakdown is the authoritative, fully itemized result of the
// discount engine for a given cart. It is produced by application/pricing
// and never recalculated by transport or persistence layers.
type PricingBreakdown struct {
	OriginalSubtotal            Cents
	CategoryDiscount            Cents
	AfterCategory               Cents
	VolumeDiscount              Cents
	AfterVolume                 Cents
	CouponDiscount              Cents
	CalculatedSavings           Cents
	MaximumSavings              Cents
	FinalSavings                Cents
	EffectiveDiscountPercentage float64
	LimitApplied                bool
	FinalTotal                  Cents
	Currency                    Currency
}

// PricedItem is a requested line enriched with authoritative catalog data.
type PricedItem struct {
	ProductID  ProductID
	Name       string
	Category   Category
	UnitPrice  Cents
	Quantity   int
	LineAmount Cents
}
