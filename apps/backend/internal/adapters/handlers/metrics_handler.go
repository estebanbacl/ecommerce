package handlers

import (
	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// MetricsHandler exposes the Prometheus exposition format for scraping.
// It carries no dependencies: every business collector registers itself
// against the default registry when its adapter is constructed.
type MetricsHandler struct{}

func NewMetricsHandler() *MetricsHandler {
	return &MetricsHandler{}
}

func (h *MetricsHandler) Routes(r chi.Router) {
	r.Handle("/metrics", promhttp.Handler())
}
