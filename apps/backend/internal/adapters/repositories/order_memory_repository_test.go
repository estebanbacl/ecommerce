package repositories

import (
	"context"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/examen-ecommerce/backend/internal/core/ports"
)

func newTestRepo() *InMemoryOrderRepository {
	return NewInMemoryOrderRepository(SeedProducts())
}

func orderFor(id string, productID domain.ProductID, quantity int) domain.Order {
	return domain.Order{
		ID:     id,
		Status: domain.OrderConfirmed,
		Items: []domain.PricedItem{
			{ProductID: productID, Quantity: quantity, LineAmount: domain.Cents(quantity) * 100},
		},
	}
}

func TestFindProducts_ExistingProduct(t *testing.T) {
	repo := newTestRepo()

	products, err := repo.FindProducts(context.Background(), []domain.ProductID{"tech-001"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(products) != 1 || products[0].ID != "tech-001" {
		t.Fatalf("unexpected products: %+v", products)
	}
}

func TestFindProducts_UnknownProduct(t *testing.T) {
	repo := newTestRepo()

	_, err := repo.FindProducts(context.Background(), []domain.ProductID{"missing"})
	if err != ports.ErrProductNotFound {
		t.Fatalf("expected ErrProductNotFound, got %v", err)
	}
}

func TestSaveOrderAndDecrementStock_ExactStock(t *testing.T) {
	repo := newTestRepo()

	err := repo.SaveOrderAndDecrementStock(context.Background(), orderFor("ord-1", "book-001", 3))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	products, err := repo.FindProducts(context.Background(), []domain.ProductID{"book-001"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if products[0].Stock != 0 {
		t.Fatalf("expected stock 0, got %d", products[0].Stock)
	}
}

func TestSaveOrderAndDecrementStock_InsufficientStockLeavesProductUntouched(t *testing.T) {
	repo := newTestRepo()

	err := repo.SaveOrderAndDecrementStock(context.Background(), orderFor("ord-1", "book-001", 4))

	var stockErr *ports.InsufficientStockError
	if err == nil {
		t.Fatal("expected an error")
	}
	if !asInsufficientStock(err, &stockErr) {
		t.Fatalf("expected InsufficientStockError, got %T: %v", err, err)
	}

	products, _ := repo.FindProducts(context.Background(), []domain.ProductID{"book-001"})
	if products[0].Stock != 3 {
		t.Fatalf("expected stock untouched at 3, got %d", products[0].Stock)
	}
}

func TestSaveOrderAndDecrementStock_PartialFailureLeavesNoDecrements(t *testing.T) {
	repo := newTestRepo()

	order := domain.Order{
		ID:     "ord-1",
		Status: domain.OrderConfirmed,
		Items: []domain.PricedItem{
			{ProductID: "tech-001", Quantity: 1},
			{ProductID: "book-001", Quantity: 10}, // exceeds stock of 3
		},
	}

	if err := repo.SaveOrderAndDecrementStock(context.Background(), order); err == nil {
		t.Fatal("expected an error")
	}

	products, _ := repo.FindProducts(context.Background(), []domain.ProductID{"tech-001", "book-001"})
	if products[0].Stock != 5 {
		t.Fatalf("expected tech-001 stock untouched at 5, got %d", products[0].Stock)
	}
	if products[1].Stock != 3 {
		t.Fatalf("expected book-001 stock untouched at 3, got %d", products[1].Stock)
	}
}

func TestSaveOrderAndDecrementStock_DuplicateOrderIDDoesNotDoubleDecrement(t *testing.T) {
	repo := newTestRepo()

	if err := repo.SaveOrderAndDecrementStock(context.Background(), orderFor("ord-1", "home-001", 2)); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := repo.SaveOrderAndDecrementStock(context.Background(), orderFor("ord-1", "home-001", 2)); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	products, _ := repo.FindProducts(context.Background(), []domain.ProductID{"home-001"})
	if products[0].Stock != 4 {
		t.Fatalf("expected stock 4 after two decrements of 2 from 8, got %d", products[0].Stock)
	}
}

func TestSaveOrderAndDecrementStock_ReturnedCopiesDoNotMutateRepository(t *testing.T) {
	repo := newTestRepo()

	order := orderFor("ord-1", "tech-001", 1)
	if err := repo.SaveOrderAndDecrementStock(context.Background(), order); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	stored, ok := repo.FindOrder("ord-1")
	if !ok {
		t.Fatal("expected order to be stored")
	}

	stored.Items[0].Quantity = 999

	reread, _ := repo.FindOrder("ord-1")
	if reread.Items[0].Quantity != 1 {
		t.Fatalf("mutating returned copy leaked into repository: %d", reread.Items[0].Quantity)
	}
}

func TestSaveOrderAndDecrementStock_CanceledContext(t *testing.T) {
	repo := newTestRepo()

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	if err := repo.SaveOrderAndDecrementStock(ctx, orderFor("ord-1", "tech-001", 1)); err == nil {
		t.Fatal("expected context error")
	}

	products, _ := repo.FindProducts(context.Background(), []domain.ProductID{"tech-001"})
	if products[0].Stock != 5 {
		t.Fatalf("expected stock untouched at 5, got %d", products[0].Stock)
	}
}

func TestSaveOrderAndDecrementStock_ConcurrentPurchasesOfLastUnit(t *testing.T) {
	repo := NewInMemoryOrderRepository([]domain.Product{
		{ID: "scarce-001", Name: "Scarce", UnitPrice: 100, Currency: domain.CurrencyUSD, Category: domain.CategoryHome, Stock: 1},
	})

	const attempts = 20
	var successes atomic.Int32
	var wg sync.WaitGroup

	for i := 0; i < attempts; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			ctx, cancel := context.WithTimeout(context.Background(), time.Second)
			defer cancel()

			order := orderFor("ord-concurrent", "scarce-001", 1)
			order.ID = order.ID + string(rune(i))

			if err := repo.SaveOrderAndDecrementStock(ctx, order); err == nil {
				successes.Add(1)
			}
		}(i)
	}

	wg.Wait()

	if successes.Load() != 1 {
		t.Fatalf("expected exactly 1 successful purchase of the last unit, got %d", successes.Load())
	}

	products, _ := repo.FindProducts(context.Background(), []domain.ProductID{"scarce-001"})
	if products[0].Stock != 0 {
		t.Fatalf("expected final stock 0, got %d", products[0].Stock)
	}
}

func asInsufficientStock(err error, target **ports.InsufficientStockError) bool {
	if e, ok := err.(*ports.InsufficientStockError); ok {
		*target = e
		return true
	}
	return false
}
