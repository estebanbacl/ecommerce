# Especificación de Proyecto: Scaffolding de Microservicio en Go

**Contexto:**
Eres un ingeniero de software experto en Go (Golang). Tu tarea es construir el código base (scaffolding) para un nuevo microservicio de responsabilidad única (Single Responsibility Principle). 

Este proyecto debe seguir estrictamente el **Standard Go Project Layout** y los principios de la **Arquitectura Hexagonal (Ports and Adapters)**. El objetivo es mantener la lógica de negocio (dominio) aislada de la infraestructura, dependencias externas y detalles de entrega (HTTP/gRPC).

---

## 1. Stack Tecnológico a Utilizar

*   **Lenguaje:** Go 1.22+
*   **Enrutador HTTP:** `github.com/go-chi/chi/v5`
*   **Logging:** `go.uber.org/zap`
*   **Configuración:** `github.com/kelseyhightower/envconfig` (para leer de variables de entorno)
*   **Arquitectura:** Hexagonal / Clean Architecture

---

## 2. Estructura de Directorios Requerida

El proyecto debe inicializarse con la siguiente estructura exacta:

```text
/
├── cmd/
│   └── server/
│       └── main.go           
├── internal/                 
│   ├── core/
│   │   ├── domain/           
│   │   └── ports/            
│   ├── application/          
│   └── adapters/             
│       ├── handlers/         
│       └── repositories/     
├── Dockerfile
├── Makefile
├── .golangci.yml
└── go.mod
```

---

## 3. Reglas y Restricciones Arquitectónicas (¡Importante!)

1.  **Dominio Puro:** Los archivos en `internal/core/domain/` NO deben importar nada externo (solo standard library). No deben tener tags de JSON ni de DB, son structs de negocio puros.
2.  **Inyección de Dependencias:** Todos los servicios y handlers deben recibir sus dependencias a través de constructores (ej. `NewUserService(repo ports.UserRepository)`). No se debe usar variables globales ni instanciar dependencias en el interior de las funciones.
3.  **Puertos:** 
    *   Los puertos de entrada (ej. Casos de Uso) y salida (ej. Repositorios) deben definirse como `interfaces` en `internal/core/ports/`.
4.  **Manejo de Errores:** Evita usar `panic`. Propaga los errores de forma idiomática y centraliza la respuesta HTTP de error en el handler o mediante un middleware.
5.  **Main.go:** Este es el único lugar donde se deben acoplar las capas. Aquí se lee la configuración, se inicializa el logger, la conexión a DB/memoria, se inyectan en el caso de uso, luego en el handler, y se levanta el servidor HTTP.

---

## 4. Tareas a Ejecutar (Step-by-Step)

Por favor, ejecuta las siguientes tareas en orden para construir el scaffolding. Para ilustrar la arquitectura, crea un caso de uso de ejemplo (ej. una entidad `Health` o `Ping`, o una entidad ficticia `User`).

### Paso 1: Inicialización
- Ejecuta `go mod init <elige-un-nombre-de-modulo>`.
- Crea la estructura de carpetas descrita.

### Paso 2: Dominio y Puertos (`internal/core/`)
- Crea una entidad simple en `domain` (ej. `User` con ID, Nombre y Email).
- Define en `ports` las interfaces necesarias:
  - `UserRepository`: con métodos como `Save` y `GetByID`.
  - `UserService`: con un método `CreateUser`.

### Paso 3: Casos de Uso (`internal/application/`)
- Implementa la interfaz `UserService` en esta capa.
- El struct debe recibir `UserRepository` por inyección.

### Paso 4: Adaptadores de Salida (`internal/adapters/repositories/`)
- Implementa `UserRepository` utilizando un mapa en memoria (In-Memory) simulando una base de datos para no requerir dependencias externas por ahora.

### Paso 5: Adaptadores de Entrada (`internal/adapters/handlers/`)
- Crea un HTTP Handler utilizando `go-chi/chi`.
- El handler debe recibir el puerto `UserService` (el caso de uso).
- Implementa un endpoint `POST /users` (o el recurso que hayas elegido) y un `GET /health`.

### Paso 6: Configuración y Entrada (`cmd/server/main.go`)
- Escribe el `main.go`.
- Configura `zap` logger.
- Configura las variables de entorno con `envconfig` (ej. puerto HTTP por defecto `8080`).
- Instancia el repositorio en memoria, pásalo al caso de uso, y pasa el caso de uso al handler.
- Levanta el servidor HTTP de manera elegante (graceful shutdown).

### Paso 7: Tooling (Makefile, Dockerfile y Linter)
- Crea un `Makefile` con comandos: `run`, `build`, `test`, `lint`.
- Crea un `.golangci.yml` básico.
- Crea un `Dockerfile` Multi-stage (builder usando `golang:1.22-alpine` y ejecutor usando `scratch` o `alpine`).

Al finalizar, el proyecto debe ser capaz de compilarse exitosamente con `go build -o server cmd/server/main.go` y ejecutarse sin errores.
