package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/examen-ecommerce/backend/internal/application"
	"github.com/examen-ecommerce/backend/internal/core/ports"
	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type UserHandler struct {
	service ports.UserService
	logger  *zap.Logger
}

// NewUserHandler builds a UserHandler, receiving the UserService port
// (the use case) via constructor injection.
func NewUserHandler(service ports.UserService, logger *zap.Logger) *UserHandler {
	return &UserHandler{service: service, logger: logger}
}

// Routes mounts the user-related endpoints on the given router.
func (h *UserHandler) Routes(r chi.Router) {
	r.Get("/health", h.Health)
	r.Post("/users", h.CreateUser)
}

func (h *UserHandler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

type createUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type createUserResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req createUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := h.service.CreateUser(r.Context(), req.Name, req.Email)
	if err != nil {
		h.logger.Warn("create user failed", zap.Error(err))

		status := http.StatusInternalServerError
		if errors.Is(err, application.ErrInvalidUser) {
			status = http.StatusBadRequest
		}

		writeError(w, status, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, createUserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	})
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
