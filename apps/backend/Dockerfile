FROM golang:1.22-alpine AS builder

# go.mod requires a newer language version than this base image ships;
# GOTOOLCHAIN=auto lets `go` download the matching toolchain on demand
# instead of pinning the base image to a possibly unpublished tag.
ENV GOTOOLCHAIN=auto

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

ENTRYPOINT ["./server"]
