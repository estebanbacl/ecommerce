package ports

import "time"

// Clock is injected wherever the current time matters, so tests can
// control coupon expiry and order timestamps deterministically.
type Clock interface {
	Now() time.Time
}

// IDGenerator is injected wherever an opaque identifier must be created,
// so tests can assert on deterministic order IDs.
type IDGenerator interface {
	NewID() string
}
