package repositories

import "github.com/examen-ecommerce/backend/internal/core/domain"

// SeedProducts returns the deterministic initial catalog for the MVP
// (DR-02). Prices are integer cents; USD is the only supported currency.
func SeedProducts() []domain.Product {
	return []domain.Product{
		{
			ID:        "tech-001",
			Name:      "Teclado mecánico",
			UnitPrice: 12000,
			Currency:  domain.CurrencyUSD,
			Category:  domain.CategoryTechnology,
			Stock:     5,
		},
		{
			ID:        "home-001",
			Name:      "Lámpara de escritorio",
			UnitPrice: 4500,
			Currency:  domain.CurrencyUSD,
			Category:  domain.CategoryHome,
			Stock:     8,
		},
		{
			ID:        "book-001",
			Name:      "Clean Architecture",
			UnitPrice: 6000,
			Currency:  domain.CurrencyUSD,
			Category:  domain.CategoryBooks,
			Stock:     3,
		},
	}
}
