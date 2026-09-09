package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"go.uber.org/zap"
)

const maxTelemetryBodyBytes = 4 << 10 // 4 KiB is plenty for a telemetry beacon

var frontendTelemetryEvents = promauto.NewCounterVec(prometheus.CounterOpts{
	Name: "frontend_telemetry_events_total",
	Help: "Total number of telemetry events reported by the frontend, labeled by event name.",
}, []string{"event"})

// allowedTelemetryEvents bounds cardinality: only known, low-cardinality
// event names are accepted, so an untrusted client can never grow this
// metric's label set unbounded.
var allowedTelemetryEvents = map[string]struct{}{
	"coupon_apply_clicked":       {},
	"discount_limit_alert_shown": {},
}

// TelemetryHandler receives frontend telemetry beacons (e.g. UI clicks,
// business-relevant renders) and turns them into Prometheus counters. It
// never persists events or exposes them back to callers.
type TelemetryHandler struct {
	logger *zap.Logger
}

func NewTelemetryHandler(logger *zap.Logger) *TelemetryHandler {
	if logger == nil {
		panic("handlers: NewTelemetryHandler requires a non-nil logger")
	}
	return &TelemetryHandler{logger: logger}
}

func (h *TelemetryHandler) Routes(r chi.Router) {
	r.Post("/api/metrics", h.Record)
}

type telemetryEventRequest struct {
	Event string `json:"event"`
}

func (h *TelemetryHandler) Record(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxTelemetryBodyBytes)

	var req telemetryEventRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		writeError(w, h.logger, http.StatusBadRequest, "INVALID_REQUEST", "the request body is not valid JSON")
		return
	}

	if _, ok := allowedTelemetryEvents[req.Event]; !ok {
		writeError(w, h.logger, http.StatusBadRequest, "INVALID_REQUEST", "unknown telemetry event")
		return
	}

	frontendTelemetryEvents.WithLabelValues(req.Event).Inc()
	w.WriteHeader(http.StatusNoContent)
}
