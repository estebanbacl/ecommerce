package application

import (
	"context"
	"errors"

	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/examen-ecommerce/backend/internal/core/ports"
	"github.com/google/uuid"
)

var ErrInvalidUser = errors.New("name and email are required")

type userService struct {
	repo ports.UserRepository
}

// NewUserService builds a UserService, receiving its UserRepository
// dependency via constructor injection.
func NewUserService(repo ports.UserRepository) ports.UserService {
	return &userService{repo: repo}
}

func (s *userService) CreateUser(ctx context.Context, name, email string) (domain.User, error) {
	if name == "" || email == "" {
		return domain.User{}, ErrInvalidUser
	}

	user := domain.User{
		ID:    uuid.NewString(),
		Name:  name,
		Email: email,
	}

	if err := s.repo.Save(ctx, user); err != nil {
		return domain.User{}, err
	}

	return user, nil
}
