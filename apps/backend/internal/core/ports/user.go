package ports

import (
	"context"

	"github.com/examen-ecommerce/backend/internal/core/domain"
)

// UserRepository is an output port for persisting and retrieving users.
type UserRepository interface {
	Save(ctx context.Context, user domain.User) error
	GetByID(ctx context.Context, id string) (domain.User, error)
}

// UserService is an input port exposing the user-related use cases.
type UserService interface {
	CreateUser(ctx context.Context, name, email string) (domain.User, error)
}
