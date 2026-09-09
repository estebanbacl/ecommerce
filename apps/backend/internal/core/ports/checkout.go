package ports

import (
	"context"

	"github.com/examen-ecommerce/backend/internal/core/domain"
)

// CheckoutItem is a requested line as submitted by a client: an opaque
// product ID and a quantity. Price, category and stock are never trusted
// from the caller.
type CheckoutItem struct {
	ProductID string
	Quantity  int
}

// CheckoutCommand is the input contract shared by quoting and confirming
// a cart.
type CheckoutCommand struct {
	Items      []CheckoutItem
	CouponCode string
}

// QuoteResult is a non-binding preview of the discount calculation. It
// never mutates stock or persists anything.
type QuoteResult struct {
	Items     []domain.PricedItem
	Coupon    domain.CouponResult
	Breakdown domain.PricingBreakdown
}

// CheckoutResult is the authoritative outcome of a confirmed order.
type CheckoutResult struct {
	Order domain.Order
}

// CheckoutService is the input port exposing the checkout use cases.
// Handlers depend on this interface, never on a concrete implementation.
type CheckoutService interface {
	QuoteCart(ctx context.Context, command CheckoutCommand) (QuoteResult, error)
	Checkout(ctx context.Context, command CheckoutCommand) (CheckoutResult, error)
}

// OrderRepository is the output port for catalog and order persistence.
// SaveOrderAndDecrementStock must be atomic: either every line is valid
// and stock/order are updated together, or nothing changes.
type OrderRepository interface {
	ListProducts(ctx context.Context) ([]domain.Product, error)
	FindProducts(ctx context.Context, ids []domain.ProductID) ([]domain.Product, error)
	SaveOrderAndDecrementStock(ctx context.Context, order domain.Order) error
}
