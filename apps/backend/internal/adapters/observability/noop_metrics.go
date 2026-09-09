package observability

import "github.com/examen-ecommerce/backend/internal/core/domain"

// NoopMetricsRecorder discards every event. It exists so unit tests (and
// any future adapter that does not need metrics) can satisfy
// ports.MetricsRecorder without pulling in a real Prometheus registry.
type NoopMetricsRecorder struct{}

func (NoopMetricsRecorder) RecordOrderSucceeded(domain.Cents) {}
func (NoopMetricsRecorder) RecordOrderFailed(string)          {}
