package platform

import "testing"

func TestUUIDGenerator_NewIDIsUniqueAndNonEmpty(t *testing.T) {
	gen := UUIDGenerator{}

	first := gen.NewID()
	second := gen.NewID()

	if first == "" || second == "" {
		t.Fatal("expected non-empty IDs")
	}
	if first == second {
		t.Fatalf("expected unique IDs, got the same value twice: %s", first)
	}
}
