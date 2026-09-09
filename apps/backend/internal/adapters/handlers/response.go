package handlers

import (
	"encoding/json"
	"net/http"

	"go.uber.org/zap"
)

func writeJSON(w http.ResponseWriter, logger *zap.Logger, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		logger.Error("failed to encode response body", zap.Error(err))
	}
}

type errorEnvelope struct {
	Error errorBody `json:"error"`
}

type errorBody struct {
	Code    string        `json:"code"`
	Message string        `json:"message"`
	Details []errorDetail `json:"details,omitempty"`
}

type errorDetail struct {
	Field     string `json:"field,omitempty"`
	ProductID string `json:"productId,omitempty"`
	Available int    `json:"available,omitempty"`
	Requested int    `json:"requested,omitempty"`
}

func writeError(w http.ResponseWriter, logger *zap.Logger, status int, code, message string, details ...errorDetail) {
	writeJSON(w, logger, status, errorEnvelope{
		Error: errorBody{Code: code, Message: message, Details: details},
	})
}
