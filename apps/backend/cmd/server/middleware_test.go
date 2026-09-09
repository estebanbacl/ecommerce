package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"go.uber.org/zap"
)

func TestCorsMiddleware_AllowedOriginGetsHeaders(t *testing.T) {
	handler := corsMiddleware([]string{"http://localhost:5173"})(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) }),
	)

	req := httptest.NewRequest(http.MethodGet, "/api/products", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
		t.Fatalf("expected Access-Control-Allow-Origin to be echoed, got %q", got)
	}
	if rec.Code != http.StatusOK {
		t.Fatalf("expected the wrapped handler to run, got status %d", rec.Code)
	}
}

func TestCorsMiddleware_DisallowedOriginGetsNoHeaders(t *testing.T) {
	handler := corsMiddleware([]string{"http://localhost:5173"})(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) }),
	)

	req := httptest.NewRequest(http.MethodGet, "/api/products", nil)
	req.Header.Set("Origin", "http://evil.example")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("expected no CORS header for a disallowed origin, got %q", got)
	}
}

func TestCorsMiddleware_PreflightShortCircuits(t *testing.T) {
	called := false
	handler := corsMiddleware([]string{"http://localhost:5173"})(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { called = true }),
	)

	req := httptest.NewRequest(http.MethodOptions, "/api/checkout", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 for OPTIONS preflight, got %d", rec.Code)
	}
	if called {
		t.Fatal("expected the wrapped handler to be skipped for OPTIONS")
	}
}

func TestZapRequestLogger_CapturesStatusCode(t *testing.T) {
	logger := zap.NewNop()
	handler := zapRequestLogger(logger)(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusTeapot) }),
	)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusTeapot {
		t.Fatalf("expected status %d to reach the client, got %d", http.StatusTeapot, rec.Code)
	}
}

func TestZapRequestLogger_DefaultsStatusToOKWhenNeverWritten(t *testing.T) {
	logger := zap.NewNop()
	handler := zapRequestLogger(logger)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected default status 200, got %d", rec.Code)
	}
}
