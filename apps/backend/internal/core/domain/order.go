package domain

import "time"

type OrderStatus string

const OrderConfirmed OrderStatus = "CONFIRMED"

// Order is a confirmed purchase. It stores a snapshot of each item so a
// future catalog change never alters the historical meaning of the order.
type Order struct {
	ID        string
	Status    OrderStatus
	CreatedAt time.Time
	Items     []PricedItem
	Coupon    CouponResult
	Breakdown PricingBreakdown
}
