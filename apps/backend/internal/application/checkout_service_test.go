package application

import (
	"context"
	"testing"
	"time"

	"github.com/examen-ecommerce/backend/internal/adapters/repositories"
	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/examen-ecommerce/backend/internal/core/ports"
)

type fixedClock struct{ now time.Time }

func (c fixedClock) Now() time.Time { return c.now }

type fixedIDGenerator struct{ id string }

func (g fixedIDGenerator) NewID() string { return g.id }

// fakeMetricsRecorder records calls so tests can assert business metrics
// fire on the right outcomes without depending on a real Prometheus registry.
type fakeMetricsRecorder struct {
	succeeded []domain.Cents
	failed    []string
}

func (f *fakeMetricsRecorder) RecordOrderSucceeded(discount domain.Cents) {
	f.succeeded = append(f.succeeded, discount)
}

func (f *fakeMetricsRecorder) RecordOrderFailed(reason string) {
	f.failed = append(f.failed, reason)
}

func newTestService() ports.CheckoutService {
	repo := repositories.NewInMemoryOrderRepository(repositories.SeedProducts())
	clock := fixedClock{now: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)}
	return NewCheckoutService(repo, clock, fixedIDGenerator{id: "ord-test-1"}, &fakeMetricsRecorder{})
}

func TestQuoteCart_DoesNotMutateStock(t *testing.T) {
	repo := repositories.NewInMemoryOrderRepository(repositories.SeedProducts())
	clock := fixedClock{now: time.Now()}
	service := NewCheckoutService(repo, clock, fixedIDGenerator{id: "ord-1"}, &fakeMetricsRecorder{})

	_, err := service.QuoteCart(context.Background(), ports.CheckoutCommand{
		Items: []ports.CheckoutItem{{ProductID: "tech-001", Quantity: 5}},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	products, _ := repo.FindProducts(context.Background(), []domain.ProductID{"tech-001"})
	if products[0].Stock != 5 {
		t.Fatalf("quote must not decrement stock, got %d", products[0].Stock)
	}
}

func TestCheckout_EmptyCart(t *testing.T) {
	service := newTestService()

	_, err := service.Checkout(context.Background(), ports.CheckoutCommand{})
	if err != ErrEmptyCart {
		t.Fatalf("expected ErrEmptyCart, got %v", err)
	}
}

func TestCheckout_InvalidQuantity(t *testing.T) {
	service := newTestService()

	_, err := service.Checkout(context.Background(), ports.CheckoutCommand{
		Items: []ports.CheckoutItem{{ProductID: "tech-001", Quantity: 0}},
	})
	if err != ErrInvalidQuantity {
		t.Fatalf("expected ErrInvalidQuantity, got %v", err)
	}
}

func TestCheckout_UnknownProduct(t *testing.T) {
	service := newTestService()

	_, err := service.Checkout(context.Background(), ports.CheckoutCommand{
		Items: []ports.CheckoutItem{{ProductID: "missing", Quantity: 1}},
	})
	if err != ports.ErrProductNotFound {
		t.Fatalf("expected ErrProductNotFound, got %v", err)
	}
}

func TestCheckout_DuplicateProductIDsAreConsolidated(t *testing.T) {
	service := newTestService()

	result, err := service.Checkout(context.Background(), ports.CheckoutCommand{
		Items: []ports.CheckoutItem{
			{ProductID: "home-001", Quantity: 1},
			{ProductID: "home-001", Quantity: 2},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result.Order.Items) != 1 {
		t.Fatalf("expected duplicate lines consolidated into 1, got %d", len(result.Order.Items))
	}
	if result.Order.Items[0].Quantity != 3 {
		t.Fatalf("expected consolidated quantity 3, got %d", result.Order.Items[0].Quantity)
	}
}

func TestCheckout_SuccessfulOrderMatchesEngineOutput(t *testing.T) {
	service := newTestService()

	result, err := service.Checkout(context.Background(), ports.CheckoutCommand{
		Items:      []ports.CheckoutItem{{ProductID: "tech-001", Quantity: 1}},
		CouponCode: "welcome2026",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Order.ID != "ord-test-1" {
		t.Fatalf("expected injected order ID, got %s", result.Order.ID)
	}
	if result.Order.Breakdown.FinalTotal != 8721 {
		t.Fatalf("expected finalTotal 8721, got %d", result.Order.Breakdown.FinalTotal)
	}
	if result.Order.Coupon.Status != "APPLIED" {
		t.Fatalf("expected coupon applied, got %s", result.Order.Coupon.Status)
	}
}

func TestCheckout_RecordsSuccessMetricWithFinalSavings(t *testing.T) {
	repo := repositories.NewInMemoryOrderRepository(repositories.SeedProducts())
	clock := fixedClock{now: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)}
	metrics := &fakeMetricsRecorder{}
	service := NewCheckoutService(repo, clock, fixedIDGenerator{id: "ord-1"}, metrics)

	result, err := service.Checkout(context.Background(), ports.CheckoutCommand{
		Items:      []ports.CheckoutItem{{ProductID: "tech-001", Quantity: 1}},
		CouponCode: "welcome2026",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(metrics.succeeded) != 1 || metrics.succeeded[0] != result.Order.Breakdown.FinalSavings {
		t.Fatalf("expected one success metric with discount %d, got %+v", result.Order.Breakdown.FinalSavings, metrics.succeeded)
	}
	if len(metrics.failed) != 0 {
		t.Fatalf("expected no failure metrics, got %+v", metrics.failed)
	}
}

func TestCheckout_RecordsFailureMetricOnInsufficientStock(t *testing.T) {
	repo := repositories.NewInMemoryOrderRepository(repositories.SeedProducts())
	clock := fixedClock{now: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)}
	metrics := &fakeMetricsRecorder{}
	service := NewCheckoutService(repo, clock, fixedIDGenerator{id: "ord-1"}, metrics)

	_, err := service.Checkout(context.Background(), ports.CheckoutCommand{
		Items: []ports.CheckoutItem{{ProductID: "book-001", Quantity: 100}},
	})
	if err == nil {
		t.Fatal("expected an error")
	}

	if len(metrics.failed) != 1 || metrics.failed[0] != "insufficient_stock" {
		t.Fatalf(`expected one "insufficient_stock" failure metric, got %+v`, metrics.failed)
	}
	if len(metrics.succeeded) != 0 {
		t.Fatalf("expected no success metrics, got %+v", metrics.succeeded)
	}
}

func TestCheckout_RecordsFailureMetricOnEmptyCart(t *testing.T) {
	metrics := &fakeMetricsRecorder{}
	repo := repositories.NewInMemoryOrderRepository(repositories.SeedProducts())
	service := NewCheckoutService(repo, fixedClock{now: time.Now()}, fixedIDGenerator{id: "ord-1"}, metrics)

	_, err := service.Checkout(context.Background(), ports.CheckoutCommand{})
	if err != ErrEmptyCart {
		t.Fatalf("expected ErrEmptyCart, got %v", err)
	}

	if len(metrics.failed) != 1 || metrics.failed[0] != "empty_cart" {
		t.Fatalf(`expected one "empty_cart" failure metric, got %+v`, metrics.failed)
	}
}
