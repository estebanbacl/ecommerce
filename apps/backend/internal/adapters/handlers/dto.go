package handlers

import "github.com/examen-ecommerce/backend/internal/core/domain"

type productResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	UnitPrice int64  `json:"unitPrice"`
	Currency  string `json:"currency"`
	Category  string `json:"category"`
	Stock     int    `json:"stock"`
}

func toProductResponse(p domain.Product) productResponse {
	return productResponse{
		ID:        string(p.ID),
		Name:      p.Name,
		UnitPrice: int64(p.UnitPrice),
		Currency:  string(p.Currency),
		Category:  string(p.Category),
		Stock:     p.Stock,
	}
}

type checkoutItemRequest struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
}

type checkoutRequest struct {
	Items      []checkoutItemRequest `json:"items"`
	CouponCode string                `json:"couponCode,omitempty"`
}

type itemResponse struct {
	ProductID  string `json:"productId"`
	Name       string `json:"name"`
	Category   string `json:"category"`
	UnitPrice  int64  `json:"unitPrice"`
	Quantity   int    `json:"quantity"`
	LineAmount int64  `json:"lineAmount"`
}

func toItemResponse(item domain.PricedItem) itemResponse {
	return itemResponse{
		ProductID:  string(item.ProductID),
		Name:       item.Name,
		Category:   string(item.Category),
		UnitPrice:  int64(item.UnitPrice),
		Quantity:   item.Quantity,
		LineAmount: int64(item.LineAmount),
	}
}

type couponResponse struct {
	Code   *string `json:"code"`
	Status string  `json:"status"`
}

func toCouponResponse(c domain.CouponResult) couponResponse {
	if c.Code == "" {
		return couponResponse{Code: nil, Status: string(c.Status)}
	}
	code := c.Code
	return couponResponse{Code: &code, Status: string(c.Status)}
}

type breakdownResponse struct {
	OriginalSubtotal            int64   `json:"originalSubtotal"`
	CategoryDiscount            int64   `json:"categoryDiscount"`
	AfterCategory               int64   `json:"afterCategory"`
	VolumeDiscount              int64   `json:"volumeDiscount"`
	AfterVolume                 int64   `json:"afterVolume"`
	CouponDiscount              int64   `json:"couponDiscount"`
	CalculatedSavings           int64   `json:"calculatedSavings"`
	MaximumSavings              int64   `json:"maximumSavings"`
	FinalSavings                int64   `json:"finalSavings"`
	EffectiveDiscountPercentage float64 `json:"effectiveDiscountPercentage"`
	LimitApplied                bool    `json:"limitApplied"`
	FinalTotal                  int64   `json:"finalTotal"`
	Currency                    string  `json:"currency"`
}

func toBreakdownResponse(b domain.PricingBreakdown) breakdownResponse {
	return breakdownResponse{
		OriginalSubtotal:            int64(b.OriginalSubtotal),
		CategoryDiscount:            int64(b.CategoryDiscount),
		AfterCategory:               int64(b.AfterCategory),
		VolumeDiscount:              int64(b.VolumeDiscount),
		AfterVolume:                 int64(b.AfterVolume),
		CouponDiscount:              int64(b.CouponDiscount),
		CalculatedSavings:           int64(b.CalculatedSavings),
		MaximumSavings:              int64(b.MaximumSavings),
		FinalSavings:                int64(b.FinalSavings),
		EffectiveDiscountPercentage: b.EffectiveDiscountPercentage,
		LimitApplied:                b.LimitApplied,
		FinalTotal:                  int64(b.FinalTotal),
		Currency:                    string(b.Currency),
	}
}

type quoteResponse struct {
	Items     []itemResponse    `json:"items"`
	Coupon    couponResponse    `json:"coupon"`
	Breakdown breakdownResponse `json:"breakdown"`
	Binding   bool              `json:"binding"`
}

type checkoutResponse struct {
	OrderID   string            `json:"orderId"`
	Status    string            `json:"status"`
	Items     []itemResponse    `json:"items"`
	Coupon    couponResponse    `json:"coupon"`
	Breakdown breakdownResponse `json:"breakdown"`
}

func toItemsResponse(items []domain.PricedItem) []itemResponse {
	out := make([]itemResponse, 0, len(items))
	for _, item := range items {
		out = append(out, toItemResponse(item))
	}
	return out
}
