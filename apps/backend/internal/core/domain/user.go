package domain

// User is a pure business entity. It must not depend on anything
// outside the standard library and must not carry JSON/DB tags.
type User struct {
	ID    string
	Name  string
	Email string
}
