package ports

import (
	"errors"
	"fmt"

	"github.com/examen-ecommerce/backend/internal/core/domain"
)

// ErrProductNotFound is returned by OrderRepository when a requested
// product ID does not belong to the catalog.
var ErrProductNotFound = errors.New("product not found")

// InsufficientStockError is returned by OrderRepository when the vigent
// stock cannot satisfy a requested quantity. It carries enough detail for
// handlers to build an actionable error response without string parsing.
type InsufficientStockError struct {
	ProductID domain.ProductID
	Available int
	Requested int
}

func (e *InsufficientStockError) Error() string {
	return fmt.Sprintf(
		"insufficient stock for product %s: available %d, requested %d",
		e.ProductID, e.Available, e.Requested,
	)
}
