package main

import (
	"context"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/examen-ecommerce/backend/internal/adapters/handlers"
	"github.com/examen-ecommerce/backend/internal/adapters/observability"
	"github.com/examen-ecommerce/backend/internal/adapters/platform"
	"github.com/examen-ecommerce/backend/internal/adapters/repositories"
	"github.com/examen-ecommerce/backend/internal/application"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/kelseyhightower/envconfig"
	"go.uber.org/zap"
)

type config struct {
	HTTPPort         string        `envconfig:"HTTP_PORT" default:"8080"`
	ReadTimeout      time.Duration `envconfig:"HTTP_READ_TIMEOUT" default:"5s"`
	WriteTimeout     time.Duration `envconfig:"HTTP_WRITE_TIMEOUT" default:"10s"`
	IdleTimeout      time.Duration `envconfig:"HTTP_IDLE_TIMEOUT" default:"60s"`
	ShutdownTimeout  time.Duration `envconfig:"SHUTDOWN_TIMEOUT" default:"10s"`
	CORSAllowOrigins []string      `envconfig:"CORS_ALLOWED_ORIGINS" default:"http://localhost:5173"`
}

func main() {
	logger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	defer func() {
		_ = logger.Sync()
	}()

	var cfg config
	if err := envconfig.Process("", &cfg); err != nil {
		logger.Fatal("failed to load config", zap.Error(err))
	}

	repo := repositories.NewInMemoryOrderRepository(repositories.SeedProducts())
	metricsRecorder := observability.NewPrometheusMetricsRecorder()
	checkoutService := application.NewCheckoutService(repo, platform.SystemClock{}, platform.UUIDGenerator{}, metricsRecorder)

	checkoutHandler := handlers.NewCheckoutHandler(checkoutService, logger)
	productsHandler := handlers.NewProductsHandler(repo, logger)
	metricsHandler := handlers.NewMetricsHandler()
	telemetryHandler := handlers.NewTelemetryHandler(logger)

	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.Recoverer)
	router.Use(zapRequestLogger(logger))
	router.Use(corsMiddleware(cfg.CORSAllowOrigins))

	checkoutHandler.Routes(router)
	productsHandler.Routes(router)
	metricsHandler.Routes(router)
	telemetryHandler.Routes(router)

	server := &http.Server{
		Addr:         ":" + cfg.HTTPPort,
		Handler:      router,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	serverErr := make(chan error, 1)
	go func() {
		logger.Info("starting server", zap.String("port", cfg.HTTPPort))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serverErr <- err
			return
		}
		serverErr <- nil
	}()

	select {
	case <-ctx.Done():
		logger.Info("shutdown signal received")
	case err := <-serverErr:
		if err != nil {
			logger.Fatal("server failed", zap.Error(err))
		}
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", zap.Error(err))
	}

	<-serverErr
	logger.Info("server stopped")
}
