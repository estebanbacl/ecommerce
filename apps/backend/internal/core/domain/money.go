package domain

// Cents represents an integer amount of monetary cents. Money values
// never use float32/float64 to avoid rounding drift.
type Cents int64

type Currency string

const CurrencyUSD Currency = "USD"

// RoundHalfUpPercent applies an integer percentage to amount and rounds
// the result to the nearest cent using ROUND_HALF_UP.
//
//	rounded = (amount * percent + 50) / 100
func RoundHalfUpPercent(amount Cents, percent int64) Cents {
	if amount <= 0 || percent <= 0 {
		return 0
	}
	return Cents((int64(amount)*percent + 50) / 100)
}

func MinCents(a, b Cents) Cents {
	if a < b {
		return a
	}
	return b
}
