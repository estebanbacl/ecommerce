package platform

import "time"

// SystemClock implements ports.Clock using the real wall clock.
type SystemClock struct{}

func (SystemClock) Now() time.Time { return time.Now().UTC() }
