package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/examen-ecommerce/backend/internal/adapters/handlers"
	"github.com/examen-ecommerce/backend/internal/adapters/repositories"
	"github.com/examen-ecommerce/backend/internal/application"
	"github.com/go-chi/chi/v5"
	"github.com/kelseyhightower/envconfig"
	"go.uber.org/zap"
)

type config struct {
	HTTPPort string `envconfig:"HTTP_PORT" default:"8080"`
}

func main() {
	logger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	defer logger.Sync()

	var cfg config
	if err := envconfig.Process("", &cfg); err != nil {
		logger.Fatal("failed to load config", zap.Error(err))
	}

	userRepo := repositories.NewUserMemoryRepository()
	userService := application.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService, logger)

	router := chi.NewRouter()
	userHandler.Routes(router)

	server := &http.Server{
		Addr:    ":" + cfg.HTTPPort,
		Handler: router,
	}

	go func() {
		logger.Info("starting server", zap.String("port", cfg.HTTPPort))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("server failed", zap.Error(err))
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	logger.Info("shutting down server")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("graceful shutdown failed", zap.Error(err))
	}

	logger.Info("server stopped")
}
