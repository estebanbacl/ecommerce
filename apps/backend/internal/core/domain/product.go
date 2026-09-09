package domain

type Category string

const (
	CategoryTechnology Category = "TECHNOLOGY"
	CategoryHome       Category = "HOME"
	CategoryBooks      Category = "BOOKS"
)

type ProductID string

// Product is a pure business entity describing a catalog item.
type Product struct {
	ID        ProductID
	Name      string
	UnitPrice Cents
	Currency  Currency
	Category  Category
	Stock     int
}

// RequestedItem is a consolidated line requested by a client.
type RequestedItem struct {
	ProductID ProductID
	Quantity  int
}
