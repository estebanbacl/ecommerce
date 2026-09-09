package repositories

import (
	"context"
	"sort"
	"sync"

	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/examen-ecommerce/backend/internal/core/ports"
)

// InMemoryOrderRepository simulates a database so the checkout use case
// can run without external dependencies. It owns its own state; the
// constructor never exposes it, so no caller can mutate it from outside
// the package.
type InMemoryOrderRepository struct {
	mu       sync.RWMutex
	products map[domain.ProductID]domain.Product
	orders   map[string]domain.Order
}

var _ ports.OrderRepository = (*InMemoryOrderRepository)(nil)

// NewInMemoryOrderRepository builds a fully valid, isolated repository
// seeded with the given products. It never shares the caller's slice.
func NewInMemoryOrderRepository(products []domain.Product) *InMemoryOrderRepository {
	copied := make(map[domain.ProductID]domain.Product, len(products))
	for _, p := range products {
		copied[p.ID] = p
	}

	return &InMemoryOrderRepository{
		products: copied,
		orders:   make(map[string]domain.Order),
	}
}

// ListProducts returns every catalog product, including out-of-stock
// ones, ordered deterministically by ID.
func (r *InMemoryOrderRepository) ListProducts(ctx context.Context) ([]domain.Product, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	products := make([]domain.Product, 0, len(r.products))
	for _, product := range r.products {
		products = append(products, product)
	}

	sort.Slice(products, func(i, j int) bool {
		return products[i].ID < products[j].ID
	})

	return products, nil
}

func (r *InMemoryOrderRepository) FindProducts(ctx context.Context, ids []domain.ProductID) ([]domain.Product, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	found := make([]domain.Product, 0, len(ids))
	for _, id := range ids {
		product, ok := r.products[id]
		if !ok {
			return nil, ports.ErrProductNotFound
		}
		found = append(found, product)
	}

	return found, nil
}

// SaveOrderAndDecrementStock validates every line under a single write
// lock, applies all decrements only if every line is valid, and persists
// a defensive copy of the order. No partial state is ever observable.
func (r *InMemoryOrderRepository) SaveOrderAndDecrementStock(ctx context.Context, order domain.Order) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	for _, item := range order.Items {
		product, ok := r.products[item.ProductID]
		if !ok {
			return ports.ErrProductNotFound
		}
		if product.Stock < item.Quantity {
			return &ports.InsufficientStockError{
				ProductID: item.ProductID,
				Available: product.Stock,
				Requested: item.Quantity,
			}
		}
	}

	for _, item := range order.Items {
		product := r.products[item.ProductID]
		product.Stock -= item.Quantity
		r.products[item.ProductID] = product
	}

	r.orders[order.ID] = copyOrder(order)

	return nil
}

// FindOrder is a test-only convenience to assert persistence outcomes; it
// is not part of ports.OrderRepository.
func (r *InMemoryOrderRepository) FindOrder(id string) (domain.Order, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	order, ok := r.orders[id]
	if !ok {
		return domain.Order{}, false
	}
	return copyOrder(order), true
}

func copyOrder(order domain.Order) domain.Order {
	items := make([]domain.PricedItem, len(order.Items))
	copy(items, order.Items)
	order.Items = items
	return order
}
