# Uso de IA

Este documento registra, de forma verificable, cómo se usó IA generativa para construir `examen-ecommerce`. No incluye herramientas ni incidentes que no ocurrieron: todo lo descrito aquí puede contrastarse contra el historial de commits y la conversación real de la sesión.

## 1. Ecosistema de herramientas y propósito

Una sola herramienta de IA participó en la construcción del proyecto:

- **Claude Code (Claude Sonnet 5)**: usado de punta a punta — scaffolding del monorepo, implementación del backend en Go (dominio, motor de descuentos, adaptadores HTTP/memoria, `main.go`), implementación del frontend en React/TypeScript (estado del carrito, catálogo, checkout, UI), redacción y ajuste de pruebas (Go `testing` + Vitest/Testing Library), y esta documentación.

No se usaron Vercel v0, Codex, ni ningún framework externo de auditoría autónoma ("openclaw" u otro). No hubo delegación de la capa visual a una segunda IA: el mismo agente que escribió la lógica de negocio escribió también los componentes React y sus clases de Tailwind. Toda validación de calidad (cobertura, `go vet`, `-race`, build, tests) se ejecutó con las herramientas estándar del lenguaje (`go test`, `gofmt`, `vitest`, `tsc`), no con un agente de revisión separado.

## 2. Skills y prompts

El trabajo se dividió en fases sucesivas, dirigidas por indicaciones explícitas del usuario y por los documentos en `docs/specs/` y en `apps/*/docs/`:

1. **Scaffolding inicial**: estructura de monorepo (`apps/`, `packages/`, `docs/`), inicialización de Vite+React+TS y de un módulo Go con Gin.
2. **Reemplazo completo del backend**: al recibir `claude_code_go_spec.md` (una especificación distinta, con Arquitectura Hexagonal estricta, `chi`, `zap`, `envconfig`), se descartó el scaffold de Gin y se reconstruyó desde cero siguiendo ese documento al pie de la letra.
3. **Construcción del MVP funcional**: a partir de las especificaciones ya existentes en `apps/backend/docs/backend-specification.md`, `apps/backend/docs/adapters-implementation-plan.md`, `apps/frontend/docs/frontend-specification.md`, `apps/frontend/docs/frontend-implementation-plan.md` y `docs/specs/product-specification.md` / `user-stories.md`, se implementó: dominio puro → motor de descuentos → caso de uso de checkout → repositorio en memoria → handlers HTTP → composición en `main.go`, y en frontend: tipos → cliente HTTP → estado del carrito → catálogo/UI → cupón/cotización/checkout → alerta de límite.
4. **Ajuste visual**: corrección de un frontend sin estilos (ver §4) siguiendo una referencia estética tipo Vercel/Geist, sin tocar lógica de negocio.
5. **Auditoría de documentación**: renombrado de archivos de español a inglés y verificación explícita de referencias cruzadas rotas en todo el repositorio (no solo en `docs/`).

Restricciones de contexto que se respetaron en todo momento porque estaban explícitas en las especificaciones:

- Go: sin variables globales, sin `panic` en rutas de error esperadas, inyección de dependencias por constructor, interfaces definidas en el paquete que las consume, dinero siempre en centavos enteros (nunca `float32`/`float64`).
- TypeScript: `strict` activo, sin `any` sin justificar, errores capturados como `unknown`, uniones discriminadas para estado asíncrono en vez de banderas booleanas independientes.
- Producto: el backend es la única fuente de verdad para precios/stock/descuentos; el frontend nunca envía ni recalcula totales autoritativos.

## 3. Agentes / sub-agentes

No se invocaron sub-agentes ni herramientas de IA adicionales durante la construcción: toda la sesión corrió como un único agente de Claude Code, de forma secuencial. La única "orquestación" real fue una lista de tareas (`TaskCreate`/`TaskUpdate`) usada para trackear las 12 etapas del MVP (dominio, puertos, caso de uso, repositorio, handlers, pruebas backend; tipos, carrito, catálogo, checkout, alerta, pruebas frontend) y evitar perder el hilo dentro de la misma conversación — no un agente independiente con reglas propias de aprobación o rechazo de commits.

Cuando se propuso explícitamente instalar skills de un catálogo de terceros (`skills.sh`, vía `npx skillsadd <owner/repo>`), se señaló el riesgo de ejecutar código e instrucciones de un repositorio no auditado antes de instalar nada, y se pidió confirmación puntual por cada skill — es decir, la gobernanza aplicada fue "pedir permiso explícito", no delegar en un agente autónomo de seguridad.

## 4. Bitácora de co-creación y correcciones técnicas (auditoría)

La proporción real de este proyecto: la lógica de negocio central (motor de descuentos, reducer del carrito, contratos de dominio) se escribió directamente a partir de las reglas ya formalizadas en las especificaciones — no fue "generada y luego corregida", sino derivada de fórmulas y tablas de casos de prueba ya dadas (por ejemplo, el ejemplo de USD 120 con `WELCOME2026` → total 8721 centavos, tomado literalmente de `product-specification.md` y usado como test de referencia). El código repetitivo (DTOs de request/response, wiring en `main.go`, componentes de presentación) sí se generó más mecánicamente.

Las correcciones reales ocurridas durante la sesión fueron estas:

**Corrección 1 — Backend descartado y reconstruido por completo.** El primer scaffold usó Gin, `cmd/api/`, `internal/domain/discount_strategy.go` e `internal/infrastructure/`. Al recibir una especificación distinta (Arquitectura Hexagonal con `chi`/`zap`/`envconfig`, `cmd/server/`, `internal/core/{domain,ports}`, `internal/adapters/{handlers,repositories}`), se confirmó explícitamente con el usuario que se debía reemplazar todo (no fusionar) y se eliminaron por completo los archivos anteriores antes de reconstruir.

**Corrección 2 — Frontend sin ningún estilo aplicado.** El MVP completo del frontend (catálogo, carrito, checkout, alerta de límite) se construyó sin una sola clase de Tailwind en el JSX, a pesar de que Tailwind ya estaba configurado en el proyecto. El resultado se veía como HTML plano sin diseño. El usuario lo detectó mediante una captura de pantalla ("el front está muy maluco") y se corrigió aplicando estilo consistente (tarjetas, tipografía, botones, layout de dos columnas) a los ocho componentes de UI, sin modificar su lógica interna.

**Corrección 3 — Referencias rotas tras el renombrado de documentos.** Al renombrar los archivos de especificación de español a inglés, la primera pasada solo actualizó los enlaces cruzados dentro de los propios documentos Markdown. Quedaron cuatro referencias rotas fuera de `docs/`: dos comentarios en `internal/pricing/cap_rule.go` y `internal/pricing/engine_test.go`, y dos líneas dentro de `product-specification.md` que todavía citaban los nombres antiguos. Se encontraron y corrigieron solo después de que el usuario pidiera explícitamente una segunda verificación ("verifica si en estos archivos existen relación a los documentos"), no en la primera pasada.

**Corrección 4 — Pruebas de frontend rotas por el cambio de estilo.** Al reestructurar `CartSummary` en elementos separados (`<p>` + `<strong>`) durante el ajuste visual, una prueba que buscaba el subtotal como texto de un único nodo dejó de pasar; se corrigió consultando el contenedor padre en vez del nodo de texto exacto. De forma similar, una prueba de `DiscountLimitAlert` intentaba filtrar `getByRole('status', { name: ... })`, pero el rol `status` no computa su nombre accesible a partir del contenido de texto; se corrigió usando `toHaveTextContent` sobre el elemento en vez de filtrar por nombre.

**Nota de gobernanza sobre este mismo documento.** Se recibió una versión previa de este prompt que pedía documentar herramientas (Vercel v0, Codex, un agente "openclaw") y dos incidentes de corrección de IA que nunca ocurrieron en este proyecto (una supuesta suma lineal de porcentajes en el motor de descuentos, y un supuesto acoplamiento de Zustand dentro de un componente visual). Esa versión se rechazó explícitamente por no ser veraz, y se reemplazó por esta, que solo describe herramientas e incidentes verificables en el historial real de la sesión.
