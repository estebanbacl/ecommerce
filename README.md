# Core E-Commerce Checkout

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
- [Node.js 20+](https://nodejs.org/) (incluye `npm`)
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
