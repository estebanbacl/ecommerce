package handlers

import (
	"net/http"

	"github.com/examen-ecommerce/backend/internal/core/ports"
	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type ProductsHandler struct {
	repo   ports.OrderRepository
	logger *zap.Logger
}

func NewProductsHandler(repo ports.OrderRepository, logger *zap.Logger) *ProductsHandler {
	if repo == nil || logger == nil {
		panic("handlers: NewProductsHandler requires non-nil dependencies")
	}
	return &ProductsHandler{repo: repo, logger: logger}
}

func (h *ProductsHandler) Routes(r chi.Router) {
	r.Get("/api/products", h.List)
}

func (h *ProductsHandler) List(w http.ResponseWriter, r *http.Request) {
	products, err := h.repo.ListProducts(r.Context())
	if err != nil {
		h.logger.Error("failed to list products", zap.Error(err))
		writeError(w, h.logger, http.StatusInternalServerError, "INTERNAL_ERROR", "unable to load the catalog")
		return
	}

	responses := make([]productResponse, 0, len(products))
	for _, p := range products {
		responses = append(responses, toProductResponse(p))
	}

	writeJSON(w, h.logger, http.StatusOK, map[string]any{"products": responses})
}
