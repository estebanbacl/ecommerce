package application

import (
	"context"

	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/examen-ecommerce/backend/internal/core/ports"
	"github.com/examen-ecommerce/backend/internal/pricing"
)

type checkoutService struct {
	repo   ports.OrderRepository
	engine pricing.Engine
	clock  ports.Clock
	ids    ports.IDGenerator
}

// NewCheckoutService builds a ports.CheckoutService, receiving every
// dependency by constructor injection. No global state, no singletons.
func NewCheckoutService(repo ports.OrderRepository, clock ports.Clock, ids ports.IDGenerator) ports.CheckoutService {
	return &checkoutService{
		repo:   repo,
		engine: pricing.NewEngine(),
		clock:  clock,
		ids:    ids,
	}
}

func (s *checkoutService) QuoteCart(ctx context.Context, command ports.CheckoutCommand) (ports.QuoteResult, error) {
	consolidated, err := consolidateAndValidate(command.Items)
	if err != nil {
		return ports.QuoteResult{}, err
	}

	pricedItems, err := s.priceItems(ctx, consolidated)
	if err != nil {
		return ports.QuoteResult{}, err
	}

	coupon := pricing.ResolveCoupon(pricing.NormalizeCouponCode(command.CouponCode), s.clock.Now())
	breakdown := s.engine.Calculate(pricedItems, coupon)

	return ports.QuoteResult{Items: pricedItems, Coupon: coupon, Breakdown: breakdown}, nil
}

func (s *checkoutService) Checkout(ctx context.Context, command ports.CheckoutCommand) (ports.CheckoutResult, error) {
	consolidated, err := consolidateAndValidate(command.Items)
	if err != nil {
		return ports.CheckoutResult{}, err
	}

	pricedItems, err := s.priceItems(ctx, consolidated)
	if err != nil {
		return ports.CheckoutResult{}, err
	}

	coupon := pricing.ResolveCoupon(pricing.NormalizeCouponCode(command.CouponCode), s.clock.Now())
	breakdown := s.engine.Calculate(pricedItems, coupon)

	order := domain.Order{
		ID:        s.ids.NewID(),
		Status:    domain.OrderConfirmed,
		CreatedAt: s.clock.Now(),
		Items:     pricedItems,
		Coupon:    coupon,
		Breakdown: breakdown,
	}

	// SaveOrderAndDecrementStock validates vigent stock and persists the
	// order as a single atomic operation: either both succeed or neither does.
	if err := s.repo.SaveOrderAndDecrementStock(ctx, order); err != nil {
		return ports.CheckoutResult{}, err
	}

	return ports.CheckoutResult{Order: order}, nil
}

func (s *checkoutService) priceItems(ctx context.Context, items []domain.RequestedItem) ([]domain.PricedItem, error) {
	ids := make([]domain.ProductID, 0, len(items))
	for _, item := range items {
		ids = append(ids, item.ProductID)
	}

	products, err := s.repo.FindProducts(ctx, ids)
	if err != nil {
		return nil, err
	}

	productByID := make(map[domain.ProductID]domain.Product, len(products))
	for _, product := range products {
		productByID[product.ID] = product
	}

	pricedItems := make([]domain.PricedItem, 0, len(items))
	for _, item := range items {
		product, ok := productByID[item.ProductID]
		if !ok {
			return nil, ports.ErrProductNotFound
		}

		pricedItems = append(pricedItems, domain.PricedItem{
			ProductID:  product.ID,
			Name:       product.Name,
			Category:   product.Category,
			UnitPrice:  product.UnitPrice,
			Quantity:   item.Quantity,
			LineAmount: product.UnitPrice * domain.Cents(item.Quantity),
		})
	}

	return pricedItems, nil
}

// consolidateAndValidate merges duplicate product IDs (DR-06) and
// validates structural rules before any repository call.
func consolidateAndValidate(items []ports.CheckoutItem) ([]domain.RequestedItem, error) {
	if len(items) == 0 {
		return nil, ErrEmptyCart
	}

	order := make([]domain.ProductID, 0, len(items))
	quantities := make(map[domain.ProductID]int, len(items))

	for _, item := range items {
		if item.ProductID == "" {
			return nil, ErrInvalidProductID
		}
		if item.Quantity <= 0 {
			return nil, ErrInvalidQuantity
		}

		id := domain.ProductID(item.ProductID)
		if _, seen := quantities[id]; !seen {
			order = append(order, id)
		}
		quantities[id] += item.Quantity
	}

	consolidated := make([]domain.RequestedItem, 0, len(order))
	for _, id := range order {
		consolidated = append(consolidated, domain.RequestedItem{ProductID: id, Quantity: quantities[id]})
	}

	return consolidated, nil
}
