package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/examen-ecommerce/backend/internal/application"
	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/examen-ecommerce/backend/internal/core/ports"
	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type stubCheckoutService struct {
	quoteResult    ports.QuoteResult
	quoteErr       error
	checkoutResult ports.CheckoutResult
	checkoutErr    error
	calls          int
	lastCommand    ports.CheckoutCommand
	lastCtx        context.Context
}

func (s *stubCheckoutService) QuoteCart(ctx context.Context, command ports.CheckoutCommand) (ports.QuoteResult, error) {
	s.calls++
	s.lastCommand = command
	s.lastCtx = ctx
	return s.quoteResult, s.quoteErr
}

func (s *stubCheckoutService) Checkout(ctx context.Context, command ports.CheckoutCommand) (ports.CheckoutResult, error) {
	s.calls++
	s.lastCommand = command
	s.lastCtx = ctx
	return s.checkoutResult, s.checkoutErr
}

func newTestRouter(service ports.CheckoutService) http.Handler {
	router := chi.NewRouter()
	NewCheckoutHandler(service, zap.NewNop()).Routes(router)
	return router
}

func TestHealth_Returns200(t *testing.T) {
	router := newTestRouter(&stubCheckoutService{})

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if rec.Header().Get("Content-Type") != "application/json" {
		t.Fatalf("expected JSON content type, got %s", rec.Header().Get("Content-Type"))
	}
}

func TestCheckout_ValidRequestInvokesServiceOnce(t *testing.T) {
	stub := &stubCheckoutService{
		checkoutResult: ports.CheckoutResult{Order: domain.Order{
			ID:     "ord-1",
			Status: domain.OrderConfirmed,
			Breakdown: domain.PricingBreakdown{
				OriginalSubtotal: 1000,
				FinalTotal:       1000,
				Currency:         domain.CurrencyUSD,
			},
			Coupon: domain.CouponResult{Status: domain.CouponOmitted},
		}},
	}
	router := newTestRouter(stub)

	body := `{"items":[{"productId":"tech-001","quantity":1}],"couponCode":"WELCOME2026"}`
	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if stub.calls != 1 {
		t.Fatalf("expected the service to be invoked exactly once, got %d", stub.calls)
	}
	if stub.lastCommand.CouponCode != "WELCOME2026" {
		t.Fatalf("expected couponCode to be mapped, got %q", stub.lastCommand.CouponCode)
	}

	var decoded checkoutResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &decoded); err != nil {
		t.Fatalf("response is not valid JSON: %v", err)
	}
	if decoded.OrderID != "ord-1" {
		t.Fatalf("expected orderId ord-1, got %s", decoded.OrderID)
	}
}

func TestCheckout_InvalidJSONReturns400WithoutInvokingService(t *testing.T) {
	stub := &stubCheckoutService{}
	router := newTestRouter(stub)

	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewBufferString(`{not json`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
	if stub.calls != 0 {
		t.Fatal("service must not be invoked for malformed JSON")
	}
}

func TestCheckout_UnknownFieldReturns400(t *testing.T) {
	stub := &stubCheckoutService{}
	router := newTestRouter(stub)

	body := `{"items":[{"productId":"tech-001","quantity":1}],"unexpectedField":true}`
	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for unknown field, got %d", rec.Code)
	}
	if stub.calls != 0 {
		t.Fatal("service must not be invoked when the payload has unknown fields")
	}
}

func TestCheckout_SecondJSONDocumentReturns400(t *testing.T) {
	stub := &stubCheckoutService{}
	router := newTestRouter(stub)

	body := `{"items":[{"productId":"tech-001","quantity":1}]}{"items":[]}`
	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for a second JSON document, got %d", rec.Code)
	}
	if stub.calls != 0 {
		t.Fatal("service must not be invoked when the body has trailing content")
	}
}

func TestCheckout_ServiceEmptyCartMapsTo400(t *testing.T) {
	stub := &stubCheckoutService{checkoutErr: application.ErrEmptyCart}
	router := newTestRouter(stub)

	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewBufferString(`{"items":[{"productId":"x","quantity":1}]}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestCheckout_InsufficientStockMapsTo409WithDetails(t *testing.T) {
	stub := &stubCheckoutService{checkoutErr: &ports.InsufficientStockError{
		ProductID: "book-001", Available: 1, Requested: 3,
	}}
	router := newTestRouter(stub)

	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewBufferString(`{"items":[{"productId":"book-001","quantity":3}]}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rec.Code, rec.Body.String())
	}

	var decoded errorEnvelope
	if err := json.Unmarshal(rec.Body.Bytes(), &decoded); err != nil {
		t.Fatalf("response is not valid JSON: %v", err)
	}
	if decoded.Error.Code != "INSUFFICIENT_STOCK" {
		t.Fatalf("expected code INSUFFICIENT_STOCK, got %s", decoded.Error.Code)
	}
	if len(decoded.Error.Details) != 1 || decoded.Error.Details[0].ProductID != "book-001" {
		t.Fatalf("expected details to identify the affected product, got %+v", decoded.Error.Details)
	}
}

func TestCheckout_UnexpectedErrorMapsTo500WithoutLeakingDetails(t *testing.T) {
	stub := &stubCheckoutService{checkoutErr: errUnexpected{}}
	router := newTestRouter(stub)

	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewBufferString(`{"items":[{"productId":"x","quantity":1}]}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rec.Code)
	}
	if bytesContains(rec.Body.Bytes(), "internal detail leak") {
		t.Fatal("response must not leak internal error details")
	}
}

type errUnexpected struct{}

func (errUnexpected) Error() string { return "internal detail leak: boom" }

func bytesContains(haystack []byte, needle string) bool {
	return bytes.Contains(haystack, []byte(needle))
}
