package application

import "errors"

var (
	ErrEmptyCart        = errors.New("cart must contain at least one item")
	ErrInvalidQuantity  = errors.New("quantity must be a positive integer")
	ErrInvalidProductID = errors.New("productId must not be empty")
)
