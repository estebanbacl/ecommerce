# Core E-Commerce Checkout

MVP de checkout para e-commerce con descuentos acumulativos (categoría, volumen y cupón), límite de ahorro consolidado, validación/decremento de stock y persistencia de la orden. El backend en Go es la única fuente de verdad para precios, stock, cupones y totales; el frontend en React gestiona la intención de compra y presenta el desglose que el backend calcula.

## Tecnologías

**Backend** (`apps/backend`) — Go, Arquitectura Hexagonal (puertos y adaptadores)

- [`go-chi/chi`](https://github.com/go-chi/chi) — enrutador HTTP
- [`go.uber.org/zap`](https://github.com/uber-go/zap) — logging estructurado
- [`kelseyhightower/envconfig`](https://github.com/kelseyhightower/envconfig) — configuración por variables de entorno
- Repositorio en memoria (sin base de datos externa en este MVP)
- Patrones: Strategy + Chain of Responsibility (motor de descuentos), Repository, inyección de dependencias por constructor

**Frontend** (`apps/frontend`) — React + TypeScript estricto + Vite

- [Tailwind CSS](https://tailwindcss.com/) — estilos
- [Zod](https://zod.dev/) — validación en runtime de las respuestas HTTP
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — pruebas
- Estado del carrito con `React Context` + `useReducer`

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
