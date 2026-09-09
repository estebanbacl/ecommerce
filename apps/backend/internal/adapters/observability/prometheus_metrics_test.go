package observability

import (
	"testing"

	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/prometheus/client_golang/prometheus/testutil"
)

// A single recorder instance is shared across subtests: promauto registers
// its collectors against the default registry, and constructing a second
// instance in the same test binary would panic on duplicate registration.
func TestPrometheusMetricsRecorder(t *testing.T) {
	recorder := NewPrometheusMetricsRecorder()

	t.Run("RecordOrderSucceeded increments the counter and adds the discount", func(t *testing.T) {
		before := testutil.ToFloat64(recorder.ordersSucceeded)
		beforeDollars := testutil.ToFloat64(recorder.discountTotal)

		recorder.RecordOrderSucceeded(3279) // $32.79

		if got := testutil.ToFloat64(recorder.ordersSucceeded); got != before+1 {
			t.Fatalf("expected ordersSucceeded to increment by 1, got %v -> %v", before, got)
		}
		if got := testutil.ToFloat64(recorder.discountTotal); got != beforeDollars+32.79 {
			t.Fatalf("expected discountTotal to increase by 32.79, got %v -> %v", beforeDollars, got)
		}
	})

	t.Run("RecordOrderFailed increments the counter for its reason label", func(t *testing.T) {
		before := testutil.ToFloat64(recorder.ordersFailed.WithLabelValues("insufficient_stock"))

		recorder.RecordOrderFailed("insufficient_stock")

		if got := testutil.ToFloat64(recorder.ordersFailed.WithLabelValues("insufficient_stock")); got != before+1 {
			t.Fatalf("expected insufficient_stock failures to increment by 1, got %v -> %v", before, got)
		}
	})

	t.Run("different failure reasons are tracked independently", func(t *testing.T) {
		recorder.RecordOrderFailed("empty_cart")

		if got := testutil.ToFloat64(recorder.ordersFailed.WithLabelValues("empty_cart")); got != 1 {
			t.Fatalf("expected empty_cart failures to be 1, got %v", got)
		}
	})
}

func TestNoopMetricsRecorder_DoesNothing(t *testing.T) {
	// NoopMetricsRecorder must satisfy ports.MetricsRecorder without panicking.
	var recorder NoopMetricsRecorder
	recorder.RecordOrderSucceeded(domain.Cents(100))
	recorder.RecordOrderFailed("any_reason")
}
