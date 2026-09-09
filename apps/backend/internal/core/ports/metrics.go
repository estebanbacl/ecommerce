package ports

import "github.com/examen-ecommerce/backend/internal/core/domain"

// MetricsRecorder is an output port for business observability. It lets
// the checkout use case emit domain events (orders confirmed, orders
// rejected, discount amounts) without depending on any specific metrics
// backend — mirroring how Clock and IDGenerator are injected.
type MetricsRecorder interface {
	// RecordOrderSucceeded is called once per confirmed order, with the
	// final discount amount applied (for financial auditing).
	RecordOrderSucceeded(discount domain.Cents)
	// RecordOrderFailed is called once per rejected checkout attempt,
	// labeled with a stable, low-cardinality reason (e.g. "insufficient_stock").
	RecordOrderFailed(reason string)
}
