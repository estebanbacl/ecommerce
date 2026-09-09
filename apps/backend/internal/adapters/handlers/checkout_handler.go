package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/examen-ecommerce/backend/internal/application"
	"github.com/examen-ecommerce/backend/internal/core/ports"
	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

const maxCheckoutBodyBytes = 1 << 20 // 1 MiB

type CheckoutHandler struct {
	service ports.CheckoutService
	logger  *zap.Logger
}

// NewCheckoutHandler builds a CheckoutHandler, receiving the CheckoutService
// port (the use case) and the logger by constructor injection.
func NewCheckoutHandler(service ports.CheckoutService, logger *zap.Logger) *CheckoutHandler {
	if service == nil || logger == nil {
		panic("handlers: NewCheckoutHandler requires non-nil dependencies")
	}
	return &CheckoutHandler{service: service, logger: logger}
}

func (h *CheckoutHandler) Routes(r chi.Router) {
	r.Get("/health", h.Health)
	r.Post("/api/checkout/quote", h.Quote)
	r.Post("/api/checkout", h.Checkout)
}

func (h *CheckoutHandler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, h.logger, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *CheckoutHandler) Quote(w http.ResponseWriter, r *http.Request) {
	command, ok := h.decodeCommand(w, r)
	if !ok {
		return
	}

	result, err := h.service.QuoteCart(r.Context(), command)
	if err != nil {
		h.writeServiceError(w, err)
		return
	}

	writeJSON(w, h.logger, http.StatusOK, quoteResponse{
		Items:     toItemsResponse(result.Items),
		Coupon:    toCouponResponse(result.Coupon),
		Breakdown: toBreakdownResponse(result.Breakdown),
		Binding:   false,
	})
}

func (h *CheckoutHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	command, ok := h.decodeCommand(w, r)
	if !ok {
		return
	}

	result, err := h.service.Checkout(r.Context(), command)
	if err != nil {
		h.writeServiceError(w, err)
		return
	}

	order := result.Order
	writeJSON(w, h.logger, http.StatusOK, checkoutResponse{
		OrderID:   order.ID,
		Status:    string(order.Status),
		Items:     toItemsResponse(order.Items),
		Coupon:    toCouponResponse(order.Coupon),
		Breakdown: toBreakdownResponse(order.Breakdown),
	})
}

// decodeCommand performs safe JSON decoding and structural validation. It
// never invokes the service when the request itself is malformed.
func (h *CheckoutHandler) decodeCommand(w http.ResponseWriter, r *http.Request) (ports.CheckoutCommand, bool) {
	r.Body = http.MaxBytesReader(w, r.Body, maxCheckoutBodyBytes)

	var req checkoutRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		writeError(w, h.logger, http.StatusBadRequest, "INVALID_REQUEST", "the request body is not valid JSON")
		return ports.CheckoutCommand{}, false
	}

	if decoder.More() {
		writeError(w, h.logger, http.StatusBadRequest, "INVALID_REQUEST", "the request body must contain a single JSON document")
		return ports.CheckoutCommand{}, false
	}

	items := make([]ports.CheckoutItem, 0, len(req.Items))
	for _, item := range req.Items {
		items = append(items, ports.CheckoutItem{ProductID: item.ProductID, Quantity: item.Quantity})
	}

	return ports.CheckoutCommand{Items: items, CouponCode: req.CouponCode}, true
}

func (h *CheckoutHandler) writeServiceError(w http.ResponseWriter, err error) {
	var stockErr *ports.InsufficientStockError

	switch {
	case errors.Is(err, application.ErrEmptyCart):
		writeError(w, h.logger, http.StatusBadRequest, "EMPTY_CART", err.Error())
	case errors.Is(err, application.ErrInvalidQuantity), errors.Is(err, application.ErrInvalidProductID):
		writeError(w, h.logger, http.StatusBadRequest, "INVALID_QUANTITY", err.Error())
	case errors.Is(err, ports.ErrProductNotFound):
		writeError(w, h.logger, http.StatusNotFound, "PRODUCT_NOT_FOUND", err.Error())
	case errors.As(err, &stockErr):
		writeError(w, h.logger, http.StatusConflict, "INSUFFICIENT_STOCK", err.Error(), errorDetail{
			ProductID: string(stockErr.ProductID),
			Available: stockErr.Available,
			Requested: stockErr.Requested,
		})
	case errors.Is(err, context.Canceled), errors.Is(err, context.DeadlineExceeded), errors.Is(err, io.ErrUnexpectedEOF):
		h.logger.Debug("request canceled before completion", zap.Error(err))
		writeError(w, h.logger, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", "the request was canceled or timed out")
	default:
		h.logger.Error("unexpected checkout error", zap.Error(err))
		writeError(w, h.logger, http.StatusInternalServerError, "INTERNAL_ERROR", "an unexpected error occurred")
	}
}
