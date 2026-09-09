package repositories

import (
	"context"
	"errors"
	"sync"

	"github.com/examen-ecommerce/backend/internal/core/domain"
	"github.com/examen-ecommerce/backend/internal/core/ports"
)

var ErrUserNotFound = errors.New("user not found")

type userMemoryRepository struct {
	mu    sync.RWMutex
	users map[string]domain.User
}

// NewUserMemoryRepository builds an in-memory UserRepository, simulating
// a database so the service can run without external dependencies.
func NewUserMemoryRepository() ports.UserRepository {
	return &userMemoryRepository{
		users: make(map[string]domain.User),
	}
}

func (r *userMemoryRepository) Save(ctx context.Context, user domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.users[user.ID] = user
	return nil
}

func (r *userMemoryRepository) GetByID(ctx context.Context, id string) (domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, ok := r.users[id]
	if !ok {
		return domain.User{}, ErrUserNotFound
	}

	return user, nil
}
