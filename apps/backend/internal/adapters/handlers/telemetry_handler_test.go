package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/testutil"
	"go.uber.org/zap"
)

func newTelemetryRouter() http.Handler {
	router := chi.NewRouter()
	NewTelemetryHandler(zap.NewNop()).Routes(router)
	return router
}

func TestTelemetry_KnownEventReturns204AndIncrementsCounter(t *testing.T) {
	router := newTelemetryRouter()

	before := testutil.ToFloat64(frontendTelemetryEvents.WithLabelValues("coupon_apply_clicked"))

	req := httptest.NewRequest(http.MethodPost, "/api/metrics", bytes.NewBufferString(`{"event":"coupon_apply_clicked"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d: %s", rec.Code, rec.Body.String())
	}

	after := testutil.ToFloat64(frontendTelemetryEvents.WithLabelValues("coupon_apply_clicked"))
	if after != before+1 {
		t.Fatalf("expected counter to increment by 1, went from %v to %v", before, after)
	}
}

func TestTelemetry_UnknownEventReturns400(t *testing.T) {
	router := newTelemetryRouter()

	req := httptest.NewRequest(http.MethodPost, "/api/metrics", bytes.NewBufferString(`{"event":"totally_made_up"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestTelemetry_InvalidJSONReturns400(t *testing.T) {
	router := newTelemetryRouter()

	req := httptest.NewRequest(http.MethodPost, "/api/metrics", bytes.NewBufferString(`{not json`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestTelemetry_UnknownFieldReturns400(t *testing.T) {
	router := newTelemetryRouter()

	req := httptest.NewRequest(http.MethodPost, "/api/metrics", bytes.NewBufferString(`{"event":"coupon_apply_clicked","extra":true}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for unknown field, got %d", rec.Code)
	}
}
