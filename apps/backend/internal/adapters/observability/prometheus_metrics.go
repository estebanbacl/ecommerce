package observability

import (
	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/examen-ecommerce/backend/internal/core/ports"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

// PrometheusMetricsRecorder implements ports.MetricsRecorder by registering
// business counters/histograms against the default Prometheus registry,
// exposed later via GET /metrics (see handlers.MetricsHandler).
type PrometheusMetricsRecorder struct {
	ordersSucceeded prometheus.Counter
	ordersFailed    *prometheus.CounterVec
	discountTotal   prometheus.Counter
	discountAmount  prometheus.Histogram
}

var _ ports.MetricsRecorder = (*PrometheusMetricsRecorder)(nil)

// NewPrometheusMetricsRecorder registers every collector exactly once.
// Call it a single time from the composition root.
func NewPrometheusMetricsRecorder() *PrometheusMetricsRecorder {
	return &PrometheusMetricsRecorder{
		ordersSucceeded: promauto.NewCounter(prometheus.CounterOpts{
			Name: "checkout_orders_succeeded_total",
			Help: "Total number of orders confirmed successfully.",
		}),
		ordersFailed: promauto.NewCounterVec(prometheus.CounterOpts{
			Name: "checkout_orders_failed_total",
			Help: "Total number of checkout attempts rejected, labeled by a stable reason.",
		}, []string{"reason"}),
		discountTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: "checkout_discount_amount_dollars_total",
			Help: "Cumulative monetary amount discounted across all confirmed orders, in dollars.",
		}),
		discountAmount: promauto.NewHistogram(prometheus.HistogramOpts{
			Name:    "checkout_discount_amount_dollars",
			Help:    "Distribution of the discount amount applied per confirmed order, in dollars.",
			Buckets: prometheus.ExponentialBuckets(0.5, 2, 10),
		}),
	}
}

func (m *PrometheusMetricsRecorder) RecordOrderSucceeded(discount domain.Cents) {
	dollars := float64(discount) / 100
	m.ordersSucceeded.Inc()
	m.discountTotal.Add(dollars)
	m.discountAmount.Observe(dollars)
}

func (m *PrometheusMetricsRecorder) RecordOrderFailed(reason string) {
	m.ordersFailed.WithLabelValues(reason).Inc()
}
