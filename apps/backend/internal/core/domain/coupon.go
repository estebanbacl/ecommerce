package domain

type CouponStatus string

const (
	CouponApplied  CouponStatus = "APPLIED"
	CouponNotFound CouponStatus = "NOT_FOUND"
	CouponExpired  CouponStatus = "EXPIRED"
	CouponOmitted  CouponStatus = "OMITTED"
)

// CouponResult communicates whether a submitted coupon code was accepted.
type CouponResult struct {
	Code   string
	Status CouponStatus
}
