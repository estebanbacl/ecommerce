package pricing

import (
	"strings"
	"time"

	"github.com/examen-ecommerce/backend/internal/core/domain"
)

// WelcomeCouponCode is the only coupon recognized by this MVP (DR-03/DR-04).
const WelcomeCouponCode = "WELCOME2026"

// welcomeCouponExpiresAt documents the coupon's validity window. It is a
// placeholder decision (DR-03) far enough in the future not to interfere
// with the exam evaluation window.
var welcomeCouponExpiresAt = time.Date(2027, 1, 1, 0, 0, 0, 0, time.UTC)

// NormalizeCouponCode trims whitespace and upper-cases the code so
// "  welcome2026 " and "WELCOME2026" resolve identically (DR-04).
func NormalizeCouponCode(raw string) string {
	return strings.ToUpper(strings.TrimSpace(raw))
}

// ResolveCoupon decides the status of a normalized coupon code at a given
// instant. An empty code is OMITTED, not an error: a rejected coupon never
// invalidates the rest of the purchase.
func ResolveCoupon(code string, now time.Time) domain.CouponResult {
	if code == "" {
		return domain.CouponResult{Code: "", Status: domain.CouponOmitted}
	}

	if code != WelcomeCouponCode {
		return domain.CouponResult{Code: code, Status: domain.CouponNotFound}
	}

	if !now.Before(welcomeCouponExpiresAt) {
		return domain.CouponResult{Code: code, Status: domain.CouponExpired}
	}

	return domain.CouponResult{Code: code, Status: domain.CouponApplied}
}
