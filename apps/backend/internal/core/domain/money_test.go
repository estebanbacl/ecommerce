package domain

import "testing"

func TestRoundHalfUpPercent(t *testing.T) {
	cases := []struct {
		amount  Cents
		percent int64
		want    Cents
	}{
		{amount: 12000, percent: 10, want: 1200},
		{amount: 10800, percent: 5, want: 540},
		{amount: 10260, percent: 15, want: 1539},
		{amount: 0, percent: 10, want: 0},
		{amount: 100, percent: 0, want: 0},
		{amount: -100, percent: 10, want: 0},
		{amount: 5, percent: 50, want: 3}, // (5*50+50)/100 = 3, half-up rounding
	}

	for _, tc := range cases {
		if got := RoundHalfUpPercent(tc.amount, tc.percent); got != tc.want {
			t.Errorf("RoundHalfUpPercent(%d, %d) = %d, want %d", tc.amount, tc.percent, got, tc.want)
		}
	}
}

func TestMinCents(t *testing.T) {
	if MinCents(10, 20) != 10 {
		t.Fatal("expected 10")
	}
	if MinCents(20, 10) != 10 {
		t.Fatal("expected 10")
	}
}
