# Core E-Commerce Checkout

[![Go](https://img.shields.io/badge/Go-1.27-00ADD8?logo=go&logoColor=white)](apps/backend)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](apps/frontend)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](apps/frontend)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](apps/frontend)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](apps/frontend)
[![Vitest](https://img.shields.io/badge/Vitest-tested-6E9F18?logo=vitest&logoColor=white)](apps/frontend)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Prometheus](https://img.shields.io/badge/Prometheus-metrics-E6522C?logo=prometheus&logoColor=white)](infra/prometheus)
[![Grafana](https://img.shields.io/badge/Grafana-dashboards-F46800?logo=grafana&logoColor=white)](infra/grafana)
[![GitHub Actions](https://github.com/estebanbacl/ecommerce/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/estebanbacl/ecommerce/actions/workflows/ci.yml)

MVP de checkout para e-commerce con descuentos acumulativos (categoría, volumen y cupón), límite de ahorro consolidado, validación/decremento de stock y persistencia de la orden. El backend en Go es la única fuente de verdad para precios, stock, cupones y totales; el frontend en React gestiona la intención de compra y presenta el desglose que el backend calcula.

## Tecnologías

**Backend** (`apps/backend`) — Go, Arquitectura Hexagonal (puertos y adaptadores)

- [`go-chi/chi`](https://github.com/go-chi/chi) — enrutador HTTP
- [`go.uber.org/zap`](https://github.com/uber-go/zap) — logging estructurado
- [`kelseyhightower/envconfig`](https://github.com/kelseyhightower/envconfig) — configuración por variables de entorno
- [`prometheus/client_golang`](https://github.com/prometheus/client_golang) — métricas técnicas y de negocio (`/metrics`)
- Repositorio en memoria (sin base de datos externa en este MVP)
- Patrones: Strategy + Chain of Responsibility (motor de descuentos), Repository, inyección de dependencias por constructor

**Frontend** (`apps/frontend`) — React + TypeScript estricto + Vite

- [Tailwind CSS](https://tailwindcss.com/) — estilos
- [Zod](https://zod.dev/) — validación en runtime de las respuestas HTTP
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — pruebas
- Estado del carrito con `React Context` + `useReducer`
- Telemetría propia (`src/services/telemetry`) hacia `POST /api/metrics` del backend

**Observabilidad** (`infra/`) — stack local de monitoreo

- [Prometheus](https://prometheus.io/) — scraping de métricas cada 5s
- [Grafana](https://grafana.com/) — dashboards, con datasource y dashboard auto-provisionados
- [Docker Compose](https://docs.docker.com/compose/) — orquestación local de los tres servicios

## Evidencia de verificación

Todo lo listado abajo se ejecutó en vivo el 2026-09-09 sobre el `HEAD` actual de `develop`, con los mismos comandos que corre el pipeline de CI (no son afirmaciones sin comprobar).

### 1. Frontend — build, pruebas y cobertura

```text
$ npm run test:coverage
Test Files  9 passed (9)
     Tests  39 passed (39)

Statements   : 90.98% ( 111/122 )
Branches     : 81.94% ( 59/72 )
Functions    : 88.67% ( 47/53 )
Lines        : 90.75% ( 108/119 )

$ npm run build
✓ 137 modules transformed
✓ built in 93ms
```

Las 4 métricas superan el umbral del 80% configurado en `vite.config.ts`. El estilo (paleta violeta/stone/emerald, tarjetas `rounded-2xl`, set de íconos propio) se aplicó a los 8 componentes del checkout sin romper ningún `aria-label`/texto verificado por las pruebas existentes — confirmado por los mismos 39 tests en verde.

### 2. Backend — build, pruebas y cobertura

```text
$ go test -race ./...
ok  cmd/server
ok  internal/adapters/handlers
ok  internal/adapters/observability
ok  internal/adapters/platform
ok  internal/adapters/repositories
ok  internal/application
ok  internal/core/domain
ok  internal/core/ports
ok  internal/pricing
(9/9 paquetes, 58 pruebas, sin condiciones de carrera)

$ go build -o server ./cmd/server
# compila sin errores
```

Cobertura de la lógica de negocio central (`pricing`, `application`, `core`, `adapters/{repositories,handlers,observability}`, excluyendo el composition root no testeable de `cmd/server`): **85.8%**, sobre el umbral del 80% que exige `.github/workflows/ci.yml`.

### 3. Observabilidad — Prometheus + Grafana, tráfico real de extremo a extremo

Stack levantado con `docker-compose up --build -d` y verificado con tráfico real contra el contenedor (no simulado):

```text
$ curl -X POST http://localhost:8080/api/checkout -d '{"items":[{"productId":"tech-001","quantity":1}],"couponCode":"WELCOME2026"}'
→ 200 OK, finalTotal=8721 (coincide con el ejemplo de referencia de la especificación)

$ curl -X POST http://localhost:8080/api/checkout -d '{"items":[{"productId":"book-001","quantity":100}]}'
→ 409 INSUFFICIENT_STOCK

$ curl http://localhost:9090/api/v1/targets
→ job=backend health=up

$ curl 'http://localhost:9090/api/v1/query?query=checkout_orders_succeeded_total'
→ 1
$ curl 'http://localhost:9090/api/v1/query?query=checkout_discount_amount_dollars_total'
→ 32.79   (= $32.79, exacto al ejemplo de la especificación)
$ curl 'http://localhost:9090/api/v1/query?query=checkout_orders_failed_total'
→ {reason="insufficient_stock"} 1
$ curl 'http://localhost:9090/api/v1/query?query=frontend_telemetry_events_total'
→ {event="discount_limit_alert_shown"} 1

$ curl -u admin:admin http://localhost:3000/api/search
→ "Core E-Commerce Checkout - Overview" /d/checkout-overview/core-e-commerce-checkout-overview
```

Prometheus scrapea el contenedor real (`backend:8080/metrics` vía red interna de Docker, no el puerto del host) y refleja el mismo estado que el backend expone; el dashboard de Grafana está auto-provisionado y accesible. Durante esta verificación se encontró y corrigió un bind mount de Grafana que había quedado obsoleto tras 11 horas de uptime del contenedor (se resolvió con `docker-compose down && up`) — el detalle completo está en `docs/ai-usage.md`, sección 8.

### 4. Pipeline de CI (GitHub Actions) — corrida real, con un fallo genuino encontrado y corregido

`.github/workflows/ci.yml` dispara en `pull_request` hacia `master`. La primera corrida real ([PR #1](https://github.com/estebanbacl/ecommerce/pull/1)) mostró: **backend `success`**, **frontend `failure`** (`Test Files no tests`, `Errors 9 errors`, cobertura 0% en las 4 métricas).

Diagnóstico sin `gh` CLI ni token de API disponibles en este entorno: se reprodujo el fallo localmente con Docker, ejecutando `apps/frontend` dentro de un contenedor `node:20-bookworm` (el mismo Node que pedía el job). Reprodujo idéntico:

```text
TypeError: webidl.util.markAsUncloneable is not a function
  at new CacheStorage node_modules/undici/lib/web/cache/cachestorage.js
  at jsdom/lib/api.js
```

`jsdom` 30 depende de una API interna de `undici` que **no existe en Node 20**, solo desde Node 22. Se confirmó la causa (no solo el síntoma) repitiendo la misma reproducción en `node:22-bookworm`: los mismos 39 tests, las mismas cifras de cobertura del punto 1, en verde — `npm run build` también limpio bajo Node 22 en Linux.

**Corrección aplicada:** `node-version` en `ci.yml` pasó de `"20"` a `"22"` (con comentario explicando por qué, para que no se revierta sin contexto), y se actualizó el prerrequisito de Node en este README — el problema no era exclusivo de CI, cualquiera con Node 20 localmente tendría el mismo fallo. El detalle completo, incluyendo la hipótesis inicial que se investigó y se descartó por no ser la causa real, está en `docs/ai-usage.md`, sección 10.

## Arquitectura y documentación

- [`docs/architecture.md`](docs/architecture.md) — decisiones arquitectónicas, patrones de diseño y trade-offs
- [`docs/ai-usage.md`](docs/ai-usage.md) — gobernanza y bitácora de uso de IA en el proyecto
- [`docs/specs/product-specification.md`](docs/specs/product-specification.md) — especificación funcional del producto
- [`docs/specs/user-stories.md`](docs/specs/user-stories.md) — historias de usuario y criterios de aceptación
- [`apps/backend/docs/backend-specification.md`](apps/backend/docs/backend-specification.md) — especificación técnica del backend
- [`apps/backend/docs/adapters-implementation-plan.md`](apps/backend/docs/adapters-implementation-plan.md) — plan de implementación de adaptadores
- [`apps/frontend/docs/frontend-specification.md`](apps/frontend/docs/frontend-specification.md) — especificación técnica del frontend
- [`apps/frontend/docs/frontend-implementation-plan.md`](apps/frontend/docs/frontend-implementation-plan.md) — plan de implementación del frontend

## Requisitos previos

- [Go 1.22+](https://go.dev/dl/)
- [Node.js 22+](https://nodejs.org/) (incluye `npm`) — Node 20 falla: `jsdom` 30 requiere una API de `undici` que no existe antes de Node 22
- Git

### macOS

```bash
brew install go node
```

### Windows

```powershell
winget install GoLang.Go
winget install OpenJS.NodeJS.LTS
```

(o descarga los instaladores desde go.dev/dl y nodejs.org)

## Instalación y ejecución local

Clona el repositorio y entra al proyecto:

```bash
git clone git@github.com:estebanbacl/ecommerce.git
cd ecommerce
```

### 1. Backend (puerto `8080`)

**macOS / Linux:**

```bash
cd apps/backend
go run ./cmd/server
```

**Windows (PowerShell):**

```powershell
cd apps/backend
go run .\cmd\server
```

Verifica que responde:

```bash
curl http://localhost:8080/health
```

### 2. Frontend (puerto `5173`)

En otra terminal:

```bash
cd apps/frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. El archivo `apps/frontend/.env.development` ya apunta a `http://localhost:8080`; ajusta `VITE_API_BASE_URL` si cambias el puerto del backend.

## Observabilidad local (Prometheus + Grafana)

El monorepo incluye un stack de observabilidad opcional (`docker-compose.yml` + `infra/`) para visualizar métricas técnicas y de negocio: órdenes exitosas/fallidas, monto de descuentos aplicados y eventos de telemetría del frontend (clic en "Aplicar cupón", alerta de límite del 35% mostrada).

### Requisitos

Necesitas un **daemon de Docker corriendo** y el comando de Compose. Dos rutas típicas en macOS:

- **Docker Desktop** (incluye daemon + `docker compose`): `brew install --cask docker`, luego ábrelo una vez para que arranque.
- **Colima** (sin GUI): `brew install colima docker docker-compose` y `colima start`. Con esta combinación el comando es `docker-compose` (con guion), no `docker compose`.

En Windows, instala [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye WSL2 y `docker compose`).

Verifica que funciona:

```bash
docker compose version   # Docker Desktop
# o
docker-compose version   # Colima / instalación standalone
```

### Levantar el stack

Desde la raíz del monorepo:

```bash
docker compose up --build      # Docker Desktop
# o
docker-compose up --build      # Colima / standalone
```

Esto construye la imagen del backend (`apps/backend/Dockerfile`) y levanta tres contenedores:

| Servicio | URL | Descripción |
|---|---|---|
| `backend` | http://localhost:8080 | API Go, expone `GET /metrics` (Prometheus) y `POST /api/metrics` (telemetría del frontend) |
| `prometheus` | http://localhost:9090 | Scrapea `backend:8080/metrics` cada 5s (`infra/prometheus/prometheus.yml`) |
| `grafana` | http://localhost:3000 | Usuario `admin` / contraseña `admin`. Datasource y dashboard se auto-provisionan al iniciar |

Para correrlo en segundo plano, agrega `-d`; para detenerlo, `docker compose down` (o `docker-compose down`).

### Verificar que funciona

```bash
# El backend expone las métricas en formato Prometheus
curl http://localhost:8080/metrics

# El target "backend" debe aparecer como "up"
curl http://localhost:9090/api/v1/targets
```

En Grafana (`http://localhost:3000`), el dashboard **"Core E-Commerce Checkout - Overview"** ya está cargado (`infra/grafana/dashboards/checkout-overview.json`) con paneles de tasa de éxito de órdenes, monto acumulado de descuentos, fallos por razón y eventos de telemetría del frontend. Genera unas cuantas compras desde `http://localhost:5173` (con el backend apuntando al del contenedor, o corriendo ambos stacks) para ver datos reales.

### Métricas expuestas

| Métrica | Tipo | Descripción |
|---|---|---|
| `checkout_orders_succeeded_total` | Counter | Órdenes confirmadas exitosamente |
| `checkout_orders_failed_total{reason=...}` | Counter | Checkouts rechazados, por razón (`insufficient_stock`, `empty_cart`, etc.) |
| `checkout_discount_amount_dollars_total` | Counter | Monto acumulado de descuentos aplicados, en dólares (auditoría financiera) |
| `checkout_discount_amount_dollars` | Histogram | Distribución del descuento aplicado por orden |
| `frontend_telemetry_events_total{event=...}` | Counter | Eventos reportados por el frontend (`coupon_apply_clicked`, `discount_limit_alert_shown`) |

## Pruebas

**Backend:**

```bash
cd apps/backend
go test ./...
go test -race ./...
```

**Frontend:**

```bash
cd apps/frontend
npm run test
npm run build
```
