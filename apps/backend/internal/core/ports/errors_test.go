package ports

import (
	"strings"
	"testing"

	"github.com/examen-ecommerce/backend/internal/core/domain"
)

func TestInsufficientStockError_Error(t *testing.T) {
	err := &InsufficientStockError{ProductID: "book-001", Available: 1, Requested: 3}

	msg := err.Error()

	for _, want := range []string{"book-001", "available 1", "requested 3"} {
		if !strings.Contains(msg, want) {
			t.Fatalf("expected error message %q to contain %q", msg, want)
		}
	}
}

func TestInsufficientStockError_ProductIDType(t *testing.T) {
	err := &InsufficientStockError{ProductID: domain.ProductID("tech-001")}
	if err.ProductID != "tech-001" {
		t.Fatalf("expected ProductID tech-001, got %s", err.ProductID)
	}
}
