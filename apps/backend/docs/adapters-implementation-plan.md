# Plan de implementación backend - Adaptadores y arranque

## Control del documento

| Campo | Valor |
|---|---|
| Estado | Planificado con precondición bloqueante |
| Fase objetivo | Fase 2 - Adaptadores de entrada/salida y composition root |
| Aplicación | `apps/backend` |
| Lenguaje | Go |
| Arquitectura | Hexagonal |
| Especificación técnica | [`backend-specification.md`](./backend-specification.md) |
| Especificación de producto | [`product-specification.md`](../../../docs/specs/product-specification.md) |
| Historias de usuario | [`user-stories.md`](../../../docs/specs/user-stories.md) |

## 1. Objetivo

Implementar los adaptadores de salida y entrada del backend, y componer la aplicación en `cmd/server/main.go`, sin introducir reglas de negocio en HTTP o persistencia y sin invertir la dirección de dependencias de la Arquitectura Hexagonal.

El resultado esperado de esta fase es un servidor que:

- Mantenga un catálogo e inventario inicial en memoria.
- Procese `POST /api/checkout` mediante el puerto `CheckoutService`.
- Valide stock, descuente inventario y persista órdenes sin cambios parciales.
- Devuelva el desglose autoritativo calculado por el caso de uso.
- Exponga `GET /health`.
- Use dependencias inyectadas por constructores, sin variables globales.
- Arranque con configuración por entorno, logging estructurado y graceful shutdown.

## 2. Estado real y precondición

### Hallazgo

El prompt asume que la Fase 1 ya contiene dominio, puertos y casos de uso de checkout. En el estado revisado del repositorio únicamente existen entidades, puertos, servicio, handler y repositorio de ejemplo para usuarios:

```text
internal/core/domain/user.go
internal/core/ports/user.go
internal/application/user_service.go
internal/adapters/handlers/user_handler.go
internal/adapters/repositories/user_memory_repository.go
```

No se encontraron todavía:

- `CheckoutService`.
- Puerto de inventario/órdenes.
- Entidades `Product`, `Order`, `OrderItem` o `PricingBreakdown`.
- Motor de descuentos.
- Errores de dominio de checkout.

### Consecuencia

La Fase 2 no debe inventar estos contratos dentro de los adaptadores. Antes de implementarla se debe integrar o completar la Fase 1. El trabajo queda planificado, pero la ejecución de los adaptadores está bloqueada hasta superar la Compuerta 0.

## 3. Diferencias que deben resolverse

El prompt de esta fase y `backend-specification.md` contienen decisiones distintas. Para esta fase se propone seguir literalmente el prompt donde sea necesario para la evaluación y dejar preparada la migración posterior.

| Tema | Prompt de Fase 2 | Especificación backend | Decisión propuesta para esta fase |
|---|---|---|---|
| Persistencia | En memoria | SQLite | Implementar memoria ahora detrás de puertos; SQLite queda como adaptador posterior. |
| Ruta checkout | `/api/checkout` | `/api/v1/checkout` | Exponer `/api/checkout` por compatibilidad con el prompt. Versionar después sin cambiar el caso de uso. |
| Estado de creación | `200 OK` | `201 Created` | Usar `200 OK` en esta fase porque es un criterio explícito. Registrar la deuda contractual. |
| Idempotencia | No mencionada | Obligatoria | Diseñar el puerto para no impedirla; su implementación puede quedar fuera si no pertenece a Fase 1. |
| Stock insuficiente | Ejemplo `400 Bad Request` | `409 Conflict` | Usar `400` si la evaluación exige el prompt; recomendar `409` para el contrato definitivo. |
| Endpoint de catálogo | No solicitado | `GET /api/v1/products` | Fuera de esta fase salvo que lo requiera el frontend o la Fase 1. |

Estas diferencias deben convertirse en una decisión de arquitectura registrada antes de declarar la fase terminada.

## 4. Principios no negociables

- `domain` y `application` no importan `handlers`, `repositories`, `chi`, `zap` ni paquetes de configuración.
- Los adaptadores dependen de puertos; los puertos no dependen de adaptadores.
- `main.go` es el único composition root.
- No existen singletons ni variables globales mutables.
- El handler no calcula descuentos ni modifica stock.
- El repositorio no calcula descuentos ni decide reglas de negocio.
- Los DTO HTTP no son entidades de dominio.
- Ningún importe monetario utiliza `float32` o `float64`; se usan centavos enteros.
- Los errores se propagan y clasifican; no se usa `panic` para errores esperados.
- Validar, decrementar stock y persistir la orden debe ser una operación atómica en memoria.
- Toda dependencia que represente tiempo o generación de IDs debe poder sustituirse en pruebas.

## 5. Resultado estructural esperado

```text
apps/backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── product.go
│   │   │   ├── order.go
│   │   │   └── pricing.go
│   │   └── ports/
│   │       ├── checkout.go
│   │       └── order_repository.go
│   ├── application/
│   │   └── checkout_service.go
│   └── adapters/
│       ├── handlers/
│       │   ├── checkout_handler.go
│       │   ├── checkout_handler_test.go
│       │   └── response.go
│       └── repositories/
│           ├── order_memory_repository.go
│           └── order_memory_repository_test.go
├── go.mod
├── go.sum
└── Makefile
```

Los archivos de `core` y `application` corresponden a la Fase 1 y se muestran solo como precondición. Esta fase no debe redefinirlos dentro de `adapters`.

## 6. Secuencia de ejecución

### 6.1 Compuerta 0 - Validar la Fase 1

#### Objetivo

Confirmar que los adaptadores pueden implementarse contra contratos estables.

#### Actividades

- [ ] Verificar que existen las entidades de dominio necesarias.
- [ ] Verificar que el dinero se representa en centavos enteros.
- [ ] Verificar que existe un comando de entrada de checkout.
- [ ] Verificar que existe un resultado con desglose completo.
- [ ] Verificar que existe el puerto `CheckoutService` consumido por el handler.
- [ ] Verificar que existe uno o más puertos de salida para productos, stock y órdenes.
- [ ] Verificar que los errores esperados se pueden clasificar mediante `errors.Is` o `errors.As`.
- [ ] Verificar que el motor aplica categoría, volumen, cupón y límite en ese orden.
- [ ] Ejecutar las pruebas unitarias de dominio y aplicación.
- [ ] Retirar o aislar el ejemplo de usuarios cuando ya no sea parte del producto.

#### Contrato de entrada mínimo esperado

El nombre exacto puede variar, pero debe existir un contrato equivalente:

```go
type CheckoutItem struct {
    ProductID string
    Quantity  int
}

type CheckoutCommand struct {
    Items      []CheckoutItem
    CouponCode string
}
```

#### Puerto de entrada mínimo esperado

```go
type CheckoutService interface {
    Checkout(ctx context.Context, command CheckoutCommand) (CheckoutResult, error)
}
```

El handler dependerá de esta interfaz, no de una implementación concreta.

#### Puerto de salida esperado

La forma exacta debe respetar lo definido en Fase 1. Se recomienda que la operación crítica sea atómica:

```go
type OrderRepository interface {
    FindProducts(ctx context.Context, ids []string) ([]domain.Product, error)
    SaveOrderAndDecrementStock(ctx context.Context, order domain.Order) error
}
```

Si la Fase 1 define métodos separados para validar, decrementar y guardar, debe añadirse una unidad de trabajo o un método atómico. Tres llamadas públicas independientes permiten estados parciales y no satisfacen HU-03.

#### Criterio de salida

- Los contratos compilan sin depender de adaptadores.
- Las pruebas del motor y del caso de uso pasan.
- El caso de uso puede construirse con un fake del puerto de salida.

No continuar al Paso 1 si esta compuerta falla.

### 6.2 Paso 1 - Implementar el adaptador de salida

#### Archivo principal

```text
internal/adapters/repositories/order_memory_repository.go
```

#### Diseño

```go
type InMemoryOrderRepository struct {
    mu       sync.RWMutex
    products map[string]domain.Product
    orders   map[string]domain.Order
}
```

El constructor debe devolver una instancia completamente válida:

```go
func NewInMemoryOrderRepository(products []domain.Product) *InMemoryOrderRepository
```

No debe existir una instancia global del repositorio.

#### Inventario inicial

Definir el catálogo semilla en el composition root o en una función explícita del adaptador. Debe ser determinista e incluir al menos:

| ID | Nombre | Categoría | Precio | Stock |
|---|---|---|---:|---:|
| `tech-001` | Teclado mecánico | `TECHNOLOGY` | 12000 centavos | 5 |
| `home-001` | Lámpara de escritorio | `HOME` | 4500 centavos | 8 |
| `book-001` | Clean Architecture | `BOOKS` | 6000 centavos | 3 |

Los datos definitivos deben aprobar DR-02. El adaptador no debe comparar el texto localizado `Tecnología`; debe usar el valor canónico de categoría definido por dominio.

#### Responsabilidades

- [ ] Inicializar mapas propios; no conservar slices o maps mutables recibidos sin copia.
- [ ] Consultar productos por ID.
- [ ] Detectar productos inexistentes.
- [ ] Validar stock disponible para todas las líneas.
- [ ] Consolidar IDs repetidos antes de comparar stock, si no lo hace el caso de uso.
- [ ] Decrementar stock únicamente si todas las líneas son válidas.
- [ ] Persistir una copia de la orden.
- [ ] Permitir recuperar órdenes en pruebas si el puerto lo contempla.
- [ ] Respetar cancelación de `context.Context` antes de tomar locks y antes de mutar.

#### Atomicidad y concurrencia

La secuencia completa debe ocurrir bajo un único lock de escritura:

1. Verificar cancelación del contexto.
2. Tomar `mu.Lock()`.
3. Validar existencia y stock de todas las líneas.
4. Preparar las nuevas cantidades sin modificar todavía el mapa.
5. Si alguna validación falla, retornar y liberar el lock sin cambios.
6. Aplicar todos los decrementos.
7. Guardar la orden.
8. Liberar el lock.

No tomar el lock y llamar después a otro método público que intente tomar el mismo lock. Utilizar helpers privados que asuman el lock cuando sea necesario.

#### Copias defensivas

- No devolver referencias que permitan modificar el estado interno.
- Copiar slices de líneas de orden al guardar y al leer.
- Si las entidades contienen maps, copiarlos en profundidad.
- Mantener errores de repositorio envolviendo causas con `%w`.

#### Errores

El adaptador debe traducir condiciones técnicas a errores reconocibles por la aplicación, por ejemplo:

- `ErrProductNotFound`.
- `ErrInsufficientStock` con producto, solicitado y disponible.
- `context.Canceled` y `context.DeadlineExceeded` sin ocultarlos.
- `ErrOrderAlreadyExists`, si el puerto exige unicidad.

No devolver strings que el handler tenga que interpretar.

#### Pruebas del repositorio

Crear:

```text
internal/adapters/repositories/order_memory_repository_test.go
```

Casos obligatorios:

- [ ] Constructor crea un estado aislado y válido.
- [ ] Consulta un producto existente.
- [ ] Producto inexistente devuelve error clasificable.
- [ ] Stock exacto permite compra y queda en cero.
- [ ] Stock insuficiente no modifica ningún producto.
- [ ] Error en una línea posterior no deja decrementos parciales.
- [ ] IDs repetidos no evaden la validación de stock.
- [ ] Orden válida queda persistida una sola vez.
- [ ] Las copias devueltas no mutan el repositorio.
- [ ] Contexto cancelado no produce cambios.
- [ ] Dos compras concurrentes por la última unidad confirman solo una.
- [ ] `go test -race` no detecta carreras.

#### Criterio de salida

- El adaptador satisface el puerto mediante una aserción de compilación opcional:

```go
var _ ports.OrderRepository = (*InMemoryOrderRepository)(nil)
```

- Todas las pruebas del paquete pasan con detector de carreras.
- No existe estado global.
- No existen mutaciones parciales.

### 6.3 Paso 2 - Implementar adaptadores de entrada HTTP

#### Archivos

```text
internal/adapters/handlers/checkout_handler.go
internal/adapters/handlers/checkout_handler_test.go
internal/adapters/handlers/response.go
```

#### Constructor e inyección

```go
type CheckoutHandler struct {
    service ports.CheckoutService
    logger  *zap.Logger
}

func NewCheckoutHandler(
    service ports.CheckoutService,
    logger *zap.Logger,
) *CheckoutHandler
```

Reglas:

- Rechazar dependencias `nil` en el composition root o constructor.
- No construir repositorios o servicios dentro del handler.
- No usar variables globales.
- El logger no reemplaza la propagación de errores.

#### Registro de rutas

```go
func (h *CheckoutHandler) Routes(r chi.Router) {
    r.Get("/health", h.Health)
    r.Post("/api/checkout", h.Checkout)
}
```

#### DTO de solicitud

```go
type checkoutRequest struct {
    Items      []checkoutItemRequest `json:"items"`
    CouponCode string                `json:"couponCode,omitempty"`
}

type checkoutItemRequest struct {
    ProductID string `json:"productId"`
    Quantity  int    `json:"quantity"`
}
```

El request no acepta precio, categoría, subtotal ni descuentos.

#### Decodificación segura

- [ ] Limitar el body con `http.MaxBytesReader`.
- [ ] Comprobar `Content-Type` compatible con JSON.
- [ ] Usar `json.Decoder.DisallowUnknownFields()`.
- [ ] Rechazar un segundo valor JSON después del objeto principal.
- [ ] Validar carrito no vacío.
- [ ] Validar ID no vacío y cantidad positiva.
- [ ] Aplicar límites de cantidad y número de líneas definidos por producto.
- [ ] Convertir DTO a `CheckoutCommand` sin lógica de descuentos.

#### Ejecución

```text
HTTP request
  -> decode + validación estructural
  -> mapear a comando
  -> CheckoutService.Checkout(request.Context(), command)
  -> mapear resultado de aplicación a response DTO
  -> escribir JSON
```

#### DTO de respuesta

Debe exponer, como mínimo:

```go
type checkoutResponse struct {
    OrderID   string                    `json:"orderId"`
    Status    string                    `json:"status"`
    Items     []checkoutItemResponse    `json:"items"`
    Coupon    couponResponse            `json:"coupon"`
    Breakdown pricingBreakdownResponse  `json:"breakdown"`
}

type pricingBreakdownResponse struct {
    OriginalSubtotal           int64   `json:"originalSubtotal"`
    CategoryDiscount           int64   `json:"categoryDiscount"`
    AfterCategory              int64   `json:"afterCategory"`
    VolumeDiscount             int64   `json:"volumeDiscount"`
    AfterVolume                int64   `json:"afterVolume"`
    CouponDiscount             int64   `json:"couponDiscount"`
    CalculatedSavings          int64   `json:"calculatedSavings"`
    MaximumSavings             int64   `json:"maximumSavings"`
    FinalSavings               int64   `json:"finalSavings"`
    EffectiveDiscountPercent   float64 `json:"effectiveDiscountPercentage"`
    LimitApplied               bool    `json:"limitApplied"`
    FinalTotal                 int64   `json:"finalTotal"`
    Currency                   string  `json:"currency"`
}
```

El `float64` se permite únicamente en el DTO de presentación del porcentaje. Los importes continúan siendo enteros y el porcentaje nunca se usa para reconstruirlos.

#### Respuesta exitosa

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

La respuesta contiene el resultado exacto del servicio. El handler no redondea ni recalcula descuentos.

#### Contrato de errores

Envelope recomendado:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Uno o más productos no tienen stock suficiente.",
    "requestId": "req-123",
    "details": []
  }
}
```

Mapeo para la fase:

| Error | HTTP | Código JSON |
|---|---:|---|
| JSON/campos inválidos | 400 | `INVALID_REQUEST` |
| Carrito vacío | 400 | `EMPTY_CART` |
| Cantidad inválida | 400 | `INVALID_QUANTITY` |
| Producto inexistente | 400 o 404 según decisión contractual | `PRODUCT_NOT_FOUND` |
| Stock insuficiente | 400 por el prompt; 409 recomendado | `INSUFFICIENT_STOCK` |
| Contexto cancelado | No escribir si el cliente cerró; registrar a nivel debug | `REQUEST_CANCELED` |
| Error inesperado | 500 | `INTERNAL_ERROR` |

Utilizar `errors.Is` y `errors.As`. No comparar mensajes de error.

#### Endpoint de salud

`GET /health` retorna:

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{ "status": "ok" }
```

El endpoint no ejecuta el checkout ni expone configuración o memoria interna.

#### Helpers HTTP

Centralizar:

- `writeJSON`.
- `writeError`.
- Decodificación segura.
- Obtención/propagación de request ID, si se implementa middleware.

No ocultar errores de `json.Encoder`; registrarlos porque el status puede haber sido enviado.

#### Pruebas del handler

Usar `httptest` y un stub/fake de `CheckoutService`.

Casos obligatorios:

- [ ] `GET /health` devuelve 200 y JSON.
- [ ] Checkout válido invoca una vez el servicio con el comando esperado.
- [ ] Respuesta exitosa devuelve 200 y desglose completo.
- [ ] Cupón se mapea correctamente.
- [ ] Body vacío o JSON inválido devuelve 400.
- [ ] Campo desconocido devuelve 400.
- [ ] Segundo documento JSON devuelve 400.
- [ ] Carrito vacío devuelve 400 sin invocar el servicio.
- [ ] Cantidad inválida devuelve 400 sin invocar el servicio.
- [ ] Stock insuficiente se mapea al estado acordado.
- [ ] Error inesperado devuelve 500 sin filtrar detalles internos.
- [ ] `Content-Type` de todas las respuestas es JSON.
- [ ] El contexto del request llega al servicio.

#### Criterio de salida

- Los handlers dependen únicamente del puerto de entrada y del logger.
- No contienen reglas de negocio.
- Todas las rutas y contratos están cubiertos por pruebas.
- No existe `panic` en flujos esperados.

### 6.4 Paso 3 - Configurar `cmd/server/main.go`

#### Responsabilidad

`main.go` compone objetos concretos, configura el servidor y controla su ciclo de vida. No contiene lógica de checkout.

#### Configuración

```go
type config struct {
    HTTPPort       string        `envconfig:"HTTP_PORT" default:"8080"`
    ReadTimeout    time.Duration `envconfig:"HTTP_READ_TIMEOUT" default:"5s"`
    WriteTimeout   time.Duration `envconfig:"HTTP_WRITE_TIMEOUT" default:"10s"`
    IdleTimeout    time.Duration `envconfig:"HTTP_IDLE_TIMEOUT" default:"60s"`
    ShutdownTimeout time.Duration `envconfig:"SHUTDOWN_TIMEOUT" default:"10s"`
}
```

Actividades:

- [ ] Cargar configuración con `envconfig.Process`.
- [ ] Validar puerto y duraciones.
- [ ] Crear logger `zap`.
- [ ] Asegurar `logger.Sync()` al finalizar, tolerando errores esperados de stdout/stderr.
- [ ] Crear productos semilla.
- [ ] Instanciar `InMemoryOrderRepository`.
- [ ] Instanciar la implementación de `CheckoutService` definida en Fase 1.
- [ ] Instanciar `CheckoutHandler`.
- [ ] Crear router `chi` y registrar rutas.
- [ ] Añadir middleware mínimo: request ID, recuperación y logging.
- [ ] Configurar `http.Server` con timeouts.
- [ ] Iniciar el servidor y distinguir `http.ErrServerClosed`.
- [ ] Escuchar `SIGINT` y `SIGTERM` con `signal.NotifyContext`.
- [ ] Ejecutar `server.Shutdown` con timeout.
- [ ] Esperar la terminación del goroutine del servidor antes de salir.

#### Orden de composición

```text
config
  -> logger
  -> seed products
  -> InMemoryOrderRepository
  -> CheckoutService
  -> CheckoutHandler
  -> chi.Router
  -> http.Server
```

#### Graceful shutdown

Secuencia requerida:

1. Crear un contexto cancelable por señales.
2. Levantar `ListenAndServe` en un goroutine.
3. Esperar señal o error fatal del servidor.
4. Crear un contexto independiente con `SHUTDOWN_TIMEOUT`.
5. Llamar `server.Shutdown`.
6. Esperar que `ListenAndServe` termine.
7. Sincronizar el logger.

No usar `os.Exit` después de registrar `defer`, porque impediría su ejecución.

#### Criterio de salida

- La aplicación arranca sin variables globales.
- Todas las dependencias se construyen por inyección explícita.
- `Ctrl+C` inicia apagado ordenado.
- Los errores de arranque producen salida no cero y logs accionables.

### 6.5 Paso 4 - Verificación integrada

#### Quality gates

Ejecutar en este orden:

```bash
gofmt -w .
go vet ./...
go test ./...
go test -race ./...
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
go build ./cmd/server
```

#### Prueba manual mínima

Arranque:

```bash
cd apps/backend
HTTP_PORT=8080 go run ./cmd/server
```

Healthcheck:

```bash
curl -i http://localhost:8080/health
```

Checkout de referencia:

```bash
curl -i \
  -X POST http://localhost:8080/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{
    "items": [
      { "productId": "tech-001", "quantity": 1 }
    ],
    "couponCode": "WELCOME2026"
  }'
```

Validar manualmente:

- [ ] Status 200.
- [ ] `Content-Type: application/json`.
- [ ] Descuento de categoría sobre el producto de Tecnología.
- [ ] Descuento de volumen según el total posterior a categoría.
- [ ] Descuento de cupón sobre el total posterior a volumen.
- [ ] Ahorro y total final coherentes.
- [ ] Segunda compra refleja el stock decrementado.
- [ ] Compra superior al stock retorna el error acordado.
- [ ] El servidor termina limpiamente con `Ctrl+C`.

## 7. Matriz de trazabilidad

| Requisito del prompt | Actividad | Evidencia esperada |
|---|---|---|
| Repositorio en memoria | Paso 1 | Struct, constructor y pruebas. |
| Inventario preconfigurado | Paso 1 | Seed determinista con `TECHNOLOGY`. |
| Validar stock | Paso 1 | Pruebas de existencia y suficiencia. |
| Decrementar stock | Paso 1 | Pruebas de stock exacto, insuficiente y concurrencia. |
| Persistir orden | Paso 1 | Consulta o aserción de orden guardada. |
| Handler con chi | Paso 2 | Rutas registradas y pruebas `httptest`. |
| Inyección de `CheckoutService` | Paso 2 | Constructor y fake de pruebas. |
| `POST /api/checkout` | Paso 2 | Pruebas de request/response. |
| Desglose completo | Pasos 0 y 2 | Resultado de aplicación mapeado a JSON. |
| Errores sin panic | Paso 2 | Tabla de errores y pruebas. |
| `GET /health` | Paso 2 | Prueba 200. |
| Zap y envconfig | Paso 3 | Composition root. |
| Inyección repo -> servicio -> handler | Paso 3 | Orden de composición explícito. |
| Graceful shutdown | Paso 3 | Prueba manual o prueba de proceso. |

## 8. Estrategia de commits

Commits pequeños y demostrables:

1. `docs: plan backend adapters and server composition`
2. `feat(backend): add in-memory order repository`
3. `test(backend): cover inventory and concurrent checkout repository`
4. `feat(backend): add checkout and health http handlers`
5. `test(backend): cover checkout http contracts`
6. `feat(backend): compose server with config logging and shutdown`
7. `docs(backend): document run and verification commands`

No mezclar la reparación de Fase 1 con todos los adaptadores en un único commit.

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fase 1 inexistente o inestable | Adaptadores acoplados a contratos inventados | Compuerta 0 obligatoria. |
| Métodos separados para stock y orden | Estado parcial | Operación atómica o unidad de trabajo. |
| Maps compartidos sin lock | Data races y sobreventa | `sync.RWMutex` y `go test -race`. |
| Devolver referencias internas | Mutación fuera del repositorio | Copias defensivas. |
| Handler calcula descuentos | Duplicación y falta de pruebas de dominio | Mapear únicamente DTO <-> comando/resultado. |
| Errores por texto | Contrato frágil | `errors.Is`/`errors.As` y tipos de error. |
| Diferencias de rutas/status | Integración o evaluación fallida | Aprobar tabla de diferencias antes de implementar. |
| Estado en memoria se pierde | Órdenes desaparecen al reiniciar | Aceptar como limitación de fase y planear adaptador SQLite. |
| HU-04 no alcanzable | Demo incompleta | Resolver DR-01 sin alterar reglas silenciosamente. |

## 10. Definition of Ready

La implementación puede comenzar cuando:

- [ ] `CheckoutService` y sus DTO de aplicación están definidos.
- [ ] El puerto de repositorio permite atomicidad.
- [ ] Las entidades de producto, orden y desglose están definidas.
- [ ] Los errores de dominio están clasificados.
- [ ] Las pruebas de Fase 1 pasan.
- [ ] Se aprobaron ruta, status de éxito y status de stock insuficiente para esta fase.
- [ ] Se acepta que el repositorio en memoria pierde datos al reiniciar.

## 11. Definition of Done

La fase está terminada cuando:

- [ ] El repositorio en memoria implementa el puerto sin estado global.
- [ ] Inventario, decremento y orden son seguros frente a concurrencia y atómicos.
- [ ] Existe al menos un producto `TECHNOLOGY` en el seed.
- [ ] `POST /api/checkout` devuelve 200 y el desglose completo.
- [ ] `GET /health` devuelve 200.
- [ ] Los errores esperados se traducen sin `panic`.
- [ ] `main.go` inyecta repositorio, servicio y handler mediante constructores.
- [ ] Zap, envconfig, timeouts y graceful shutdown están configurados.
- [ ] `gofmt`, `go vet`, pruebas, race detector y build pasan.
- [ ] Las capas lógicas esenciales alcanzan al menos 80% de cobertura.
- [ ] README documenta el comando de arranque.
- [ ] Las diferencias temporales con `backend-specification.md` están documentadas.

## 12. Comando de arranque esperado

Cuando la implementación de esta fase haya finalizado, el comando exacto será:

```bash
cd apps/backend && HTTP_PORT=8080 go run ./cmd/server
```

La creación de este plan no implica que el comando funcione todavía: actualmente la precondición de Fase 1 no se cumple en el repositorio revisado.
