package platform

import (
	"testing"
	"time"
)

func TestSystemClock_NowReturnsUTC(t *testing.T) {
	before := time.Now().UTC()
	got := SystemClock{}.Now()
	after := time.Now().UTC()

	if got.Location() != time.UTC {
		t.Fatalf("expected UTC location, got %v", got.Location())
	}
	if got.Before(before) || got.After(after) {
		t.Fatalf("expected Now() between %v and %v, got %v", before, after, got)
	}
}
