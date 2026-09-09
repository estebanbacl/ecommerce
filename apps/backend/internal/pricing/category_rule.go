package pricing

import "github.com/examen-ecommerce/backend/internal/core/domain"

const CategoryRuleCode = "CATEGORY_10_PERCENT"

// CategoryRule discounts 10% off the lines belonging to domain.CategoryTechnology.
type CategoryRule struct {
	Percent  int64
	Category domain.Category
}

func NewCategoryDiscountRule() CategoryRule {
	return CategoryRule{Percent: 10, Category: domain.CategoryTechnology}
}

func (r CategoryRule) Code() string { return CategoryRuleCode }

func (r CategoryRule) Apply(ctx PricingContext, current domain.Cents) RuleResult {
	var categorySubtotal domain.Cents
	for _, item := range ctx.Items {
		if item.Category == r.Category {
			categorySubtotal += item.LineAmount
		}
	}

	discount := domain.RoundHalfUpPercent(categorySubtotal, r.Percent)
	return RuleResult{Discount: discount, Total: current - discount}
}
