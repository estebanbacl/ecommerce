package pricing

import (
	"testing"
	"time"

	"github.com/examen-ecommerce/backend/internal/core/domain"
)

func TestNormalizeCouponCode(t *testing.T) {
	cases := map[string]string{
		"  welcome2026 ": "WELCOME2026",
		"Welcome2026":    "WELCOME2026",
		"":               "",
	}

	for input, want := range cases {
		if got := NormalizeCouponCode(input); got != want {
			t.Errorf("NormalizeCouponCode(%q) = %q, want %q", input, got, want)
		}
	}
}

func TestResolveCoupon(t *testing.T) {
	now := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)

	cases := []struct {
		name string
		code string
		want domain.CouponStatus
	}{
		{"omitted when empty", "", domain.CouponOmitted},
		{"applied for the active code", WelcomeCouponCode, domain.CouponApplied},
		{"not found for any other code", "OTHERCODE", domain.CouponNotFound},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			result := ResolveCoupon(tc.code, now)
			if result.Status != tc.want {
				t.Errorf("ResolveCoupon(%q) status = %s, want %s", tc.code, result.Status, tc.want)
			}
		})
	}
}

func TestResolveCoupon_Expired(t *testing.T) {
	past := welcomeCouponExpiresAt.Add(time.Hour)
	result := ResolveCoupon(WelcomeCouponCode, past)

	if result.Status != domain.CouponExpired {
		t.Fatalf("expected CouponExpired, got %s", result.Status)
	}
}
