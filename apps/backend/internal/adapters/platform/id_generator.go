package platform

import "github.com/google/uuid"

// UUIDGenerator implements ports.IDGenerator using random UUIDs.
type UUIDGenerator struct{}

func (UUIDGenerator) NewID() string { return uuid.NewString() }
