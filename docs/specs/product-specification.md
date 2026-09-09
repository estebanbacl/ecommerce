# Especificacion de producto: Core E-Commerce con descuentos acumulativos

## Control del documento

| Campo | Valor |
|---|---|
| Estado | Borrador para validacion |
| Version | 1.0 |
| Producto | Checkout e-commerce con descuentos acumulativos |
| Alcance | MVP |
| Fuente | `Prueba Tecnica Full Stack - Core E-Commerce.pdf` |
| Audiencia | Producto, desarrollo, QA y evaluadores tecnicos |

## 1. Proposito

Esta especificacion define el comportamiento funcional esperado de un MVP de checkout para e-commerce. El producto permite consultar un catalogo, gestionar un carrito, aplicar descuentos acumulativos, confirmar una compra, validar y actualizar el inventario, persistir la orden y presentar al cliente un desglose verificable de los importes.

El documento convierte el enunciado original en requisitos identificables, reglas deterministas y criterios de aceptacion comprobables. Las restricciones de arquitectura, calidad, entrega y gobernanza de IA se registran separadamente porque no describen comportamiento funcional del producto.

## 2. Objetivo del producto

Permitir que un cliente construya y confirme una orden de compra con descuentos acumulativos, garantizando que:

- El subtotal del carrito se actualice inmediatamente.
- Los descuentos se calculen en el orden establecido.
- El backend sea la fuente de verdad para precios, stock y totales.
- El descuento consolidado no supere el limite configurado.
- Una compra confirmada actualice el stock y quede persistida.
- El cliente pueda comprender el calculo mediante un desglose completo.

## 3. Criterios de exito del MVP

- Un cliente puede completar el flujo desde el catalogo hasta la confirmacion de la orden.
- El mismo carrito y las mismas reglas producen siempre el mismo resultado.
- Ninguna operacion deja el stock en un valor negativo.
- Una orden rechazada no modifica el stock ni genera una orden confirmada.
- El frontend muestra los totales definitivos calculados por el backend.
- Cada requisito funcional critico tiene al menos un criterio de aceptacion y una prueba asociada.

## 4. Alcance

### 4.1 Incluido

- Catalogo preconfigurado de productos.
- Visualizacion de ID, nombre, precio unitario, categoria y stock.
- Adicion, reduccion y eliminacion de productos del carrito.
- Actualizacion inmediata del subtotal original.
- Ingreso y aplicacion del cupon `WELCOME2026`.
- Descuento por categoria Tecnologia.
- Descuento por volumen.
- Descuento por cupon.
- Aplicacion secuencial de descuentos.
- Limite consolidado de descuento del 35%.
- Desglose de descuentos, ahorro y total final.
- Validacion de stock durante el checkout.
- Decremento de stock al confirmar una orden.
- Persistencia de la orden.
- Confirmacion o rechazo explicito del checkout.
- Notificacion visual cuando se aplique el limite maximo.

### 4.2 Fuera de alcance

Salvo que se apruebe como ampliacion posterior, el MVP no incluye:

- Registro, autenticacion o perfiles de usuario.
- Procesamiento de pagos reales.
- Impuestos, envio o direcciones de entrega.
- Administracion de catalogo, inventario o cupones.
- Multiples monedas.
- Devoluciones, reembolsos o cancelaciones.
- Reservas temporales de inventario.
- Recomendaciones de productos.

## 5. Actores

| Actor | Descripcion |
|---|---|
| Cliente | Consulta productos, gestiona el carrito, aplica un cupon y confirma la compra. |
| Frontend | Presenta el estado del carrito, solicita calculos y muestra las respuestas del backend. |
| Backend | Valida entradas y stock, obtiene precios vigentes, calcula descuentos, actualiza inventario y persiste ordenes. |

## 6. Glosario

| Termino | Definicion |
|---|---|
| Subtotal original | Suma de `precio unitario x cantidad` antes de aplicar descuentos. |
| Total intermedio | Importe resultante despues de una regla y utilizado como base de la regla siguiente. |
| Descuento efectivo | Porcentaje que representa el ahorro final respecto del subtotal original. |
| Ahorro calculado | Diferencia entre el subtotal original y el total obtenido antes de aplicar el limite. |
| Ahorro final | Menor valor entre el ahorro calculado y el ahorro maximo permitido. |
| Limite aplicado | Indicador de que el ahorro calculado superaba el maximo y fue truncado. |
| Checkout | Operacion autoritativa que valida y confirma una orden. |
| Stock conocido | Stock mostrado por el frontend, que puede quedar desactualizado antes del checkout. |
| Stock vigente | Stock validado por el backend al procesar el checkout. |

## 7. Requisitos funcionales

### 7.1 Catalogo

| ID | Requisito | Prioridad |
|---|---|---|
| RF-CAT-01 | El sistema debe mostrar la lista de productos preconfigurados. | Alta |
| RF-CAT-02 | Cada producto debe mostrar ID, nombre, precio unitario, categoria y stock disponible. | Alta |
| RF-CAT-03 | Los precios y el stock autoritativos deben proceder del backend. | Alta |

### 7.2 Carrito

| ID | Requisito | Prioridad |
|---|---|---|
| RF-CAR-01 | El cliente debe poder agregar un producto al carrito. | Alta |
| RF-CAR-02 | El cliente debe poder incrementar y reducir la cantidad de un producto. | Alta |
| RF-CAR-03 | El cliente debe poder eliminar una linea del carrito. | Alta |
| RF-CAR-04 | El subtotal original debe actualizarse inmediatamente despues de cada cambio. | Alta |
| RF-CAR-05 | El frontend debe impedir cantidades negativas, decimales o iguales a cero como lineas activas. | Alta |
| RF-CAR-06 | El frontend debe advertir cuando la cantidad solicitada supera el stock conocido. | Alta |
| RF-CAR-07 | Las validaciones del frontend no deben sustituir la validacion autoritativa del backend. | Alta |

### 7.3 Cupones y calculo previo

| ID | Requisito | Prioridad |
|---|---|---|
| RF-CUP-01 | El cliente debe poder ingresar un codigo de cupon y seleccionar `Aplicar`. | Alta |
| RF-CUP-02 | El codigo activo `WELCOME2026` debe producir un descuento del 15% en la etapa correspondiente. | Alta |
| RF-CUP-03 | Un cupon desconocido o expirado no debe producir descuento. | Alta |
| RF-CUP-04 | El sistema debe comunicar si el cupon fue aceptado, rechazado o esta expirado. | Alta |
| RF-DES-01 | El calculo debe aplicar las reglas en el orden categoria, volumen, cupon y limite. | Alta |
| RF-DES-02 | La respuesta debe incluir el importe de cada descuento, incluso cuando sea cero. | Alta |
| RF-DES-03 | La respuesta debe incluir subtotal original, ahorro total, porcentaje efectivo y total final. | Alta |
| RF-DES-04 | El frontend debe mostrar los importes calculados por el backend sin sustituirlos por un calculo local. | Alta |

### 7.4 Checkout, stock y persistencia

| ID | Requisito | Prioridad |
|---|---|---|
| RF-CHK-01 | El backend debe recibir los identificadores y cantidades del carrito, y opcionalmente el codigo de cupon. | Alta |
| RF-CHK-02 | El backend debe ignorar como fuente de verdad cualquier precio o total enviado por el cliente. | Alta |
| RF-CHK-03 | El backend debe obtener los precios vigentes y recalcular todos los importes. | Alta |
| RF-CHK-04 | El backend debe validar que todos los productos existan y tengan stock suficiente. | Alta |
| RF-CHK-05 | Si la solicitud es valida, el backend debe decrementar el stock y persistir la orden. | Alta |
| RF-CHK-06 | El decremento de stock y la confirmacion de la orden deben completarse como una sola operacion logica. | Alta |
| RF-CHK-07 | Si falla una validacion, no se debe modificar el stock ni persistir una orden confirmada. | Alta |
| RF-CHK-08 | Una respuesta satisfactoria debe incluir el ID de la orden, su estado y el desglose definitivo. | Alta |
| RF-CHK-09 | Una respuesta fallida debe incluir un codigo estable y un mensaje comprensible. | Alta |

### 7.5 Alerta de limite

| ID | Requisito | Prioridad |
|---|---|---|
| RF-UI-01 | La respuesta del backend debe indicar explicitamente si se aplico el limite maximo. | Alta |
| RF-UI-02 | Cuando `limitApplied` sea verdadero, el frontend debe mostrar una alerta persistente y visualmente distintiva. | Alta |
| RF-UI-03 | La alerta debe indicar: `¡Enhorabuena! Has alcanzado el limite maximo de ahorro permitido (35%)`. | Alta |
| RF-UI-04 | La alerta debe permanecer visible mientras el calculo vigente conserve `limitApplied = true`. | Alta |

## 8. Reglas de negocio

### RN-01. Subtotal original

Para cada linea:

```text
lineAmount = unitPrice * quantity
```

Para el carrito:

```text
originalSubtotal = sum(lineAmount)
```

### RN-02. Descuento de categoria

Se aplica un descuento del 10% exclusivamente sobre las lineas cuya categoria sea `Tecnologia`.

```text
technologySubtotal = sum(lineAmount where category = "Tecnologia")
categoryDiscount = technologySubtotal * 0.10
afterCategory = originalSubtotal - categoryDiscount
```

La existencia de un producto de Tecnologia no descuenta los productos de otras categorias.

### RN-03. Descuento por volumen

Si el total posterior al descuento de categoria es estrictamente mayor que USD 100, se aplica un 5% sobre todo ese total intermedio.

```text
volumeDiscount = afterCategory > 100.00
  ? afterCategory * 0.05
  : 0

afterVolume = afterCategory - volumeDiscount
```

Un valor exactamente igual a USD 100 no activa esta regla.

### RN-04. Descuento por cupon

Si el codigo es `WELCOME2026` y esta activo, se aplica un 15% sobre el total posterior al descuento por volumen.

```text
couponDiscount = validCoupon
  ? afterVolume * 0.15
  : 0

calculatedTotal = afterVolume - couponDiscount
```

### RN-05. Limite consolidado

El ahorro final no puede superar el 35% del subtotal original.

```text
calculatedSavings = originalSubtotal - calculatedTotal
maximumSavings = originalSubtotal * 0.35
finalSavings = min(calculatedSavings, maximumSavings)
finalTotal = originalSubtotal - finalSavings
effectiveDiscountPercentage = finalSavings / originalSubtotal * 100
limitApplied = calculatedSavings > maximumSavings
```

Para un carrito vacio, el porcentaje efectivo debe ser `0` y no se debe realizar una division entre cero.

### RN-06. Precision monetaria

Decision propuesta, pendiente de aprobacion:

- Representar importes en centavos enteros.
- Utilizar USD como moneda del MVP.
- Redondear cada descuento a centavos con la estrategia `ROUND_HALF_UP`.
- Utilizar el importe ya redondeado como entrada de la etapa siguiente.
- Devolver porcentajes solo con fines de presentacion; los totales deben derivarse de importes monetarios, no del porcentaje mostrado.

### RN-07. Fuente de verdad

- El backend es la fuente de verdad para producto, precio, categoria, stock, validez del cupon y totales.
- El frontend puede calcular un subtotal provisional para mejorar la experiencia, pero debe reemplazarlo con el resultado autoritativo del backend.
- La solicitud de checkout no debe permitir que un precio proporcionado por el cliente altere la orden.

## 9. Historias de usuario y criterios de aceptacion

### HU-01. Gestion del carrito

Como cliente de la tienda, quiero ver los productos y agregarlos o removerlos del carrito para construir mi compra y conocer su subtotal.

#### CA-HU01-01. Agregar producto

```gherkin
Dado que el catalogo contiene un producto con stock disponible
Cuando el cliente agrega una unidad al carrito
Entonces el producto aparece en el carrito
Y su cantidad es uno
Y el subtotal original se actualiza inmediatamente
```

#### CA-HU01-02. Modificar cantidad

```gherkin
Dado que un producto tiene dos unidades en el carrito
Cuando el cliente reduce su cantidad en una unidad
Entonces el producto permanece con cantidad uno
Y el subtotal original se recalcula
```

#### CA-HU01-03. Eliminar producto

```gherkin
Dado que un producto tiene una unidad en el carrito
Cuando el cliente elimina esa unidad
Entonces la linea desaparece del carrito
Y el subtotal original se recalcula
```

#### CA-HU01-04. Superar stock conocido

```gherkin
Dado que un producto muestra stock disponible de dos unidades
Cuando el cliente intenta seleccionar tres unidades
Entonces el frontend impide o revierte la cantidad invalida
Y muestra una explicacion visible
```

### HU-02. Aplicacion de cupon y desglose

Como cliente, quiero aplicar un cupon y ver el desglose de descuentos para comprender el importe final.

#### CA-HU02-01. Cupon valido

```gherkin
Dado un carrito no vacio
Y que el cupon WELCOME2026 esta activo
Cuando el cliente ingresa WELCOME2026 y selecciona Aplicar
Entonces el sistema informa que el cupon fue aceptado
Y muestra el subtotal original
Y muestra el descuento de categoria
Y muestra el descuento por volumen
Y muestra el descuento por cupon
Y muestra el ahorro total
Y muestra el porcentaje efectivo
Y muestra el total final
```

#### CA-HU02-02. Cupon invalido o expirado

```gherkin
Dado un carrito no vacio
Cuando el cliente aplica un cupon desconocido o expirado
Entonces el sistema informa por que no fue aceptado
Y el descuento por cupon es cero
Y los descuentos que no dependen del cupon se conservan
```

### HU-03. Procesamiento consistente de la orden

Como sistema de checkout, quiero validar y recalcular la orden para confirmar solo compras consistentes.

#### CA-HU03-01. Orden valida

```gherkin
Dado que todos los productos solicitados existen
Y tienen stock suficiente
Cuando el backend procesa el checkout
Entonces obtiene los precios y categorias vigentes
Y recalcula los descuentos en el orden establecido
Y decrementa el stock
Y persiste la orden confirmada
Y devuelve el identificador y el desglose definitivo
```

#### CA-HU03-02. Stock insuficiente

```gherkin
Dado que al menos un producto no tiene stock suficiente
Cuando se procesa el checkout
Entonces la operacion es rechazada
Y la respuesta identifica los productos afectados
Y no se modifica el stock de ningun producto
Y no se persiste una orden confirmada
```

#### CA-HU03-03. Datos corruptos

```gherkin
Dado que la solicitud contiene un producto inexistente o una cantidad invalida
Cuando se procesa el checkout
Entonces la operacion es rechazada con un codigo de validacion
Y no se modifica el inventario
Y no se persiste una orden confirmada
```

#### CA-HU03-04. Carrito vacio

```gherkin
Dado que la solicitud no contiene productos
Cuando se procesa el checkout
Entonces la operacion es rechazada
Y el sistema indica que el carrito no puede estar vacio
```

### HU-04. Alerta de descuento maximo

Como cliente, quiero ser notificado cuando se limite mi descuento para entender por que no se aplica un ahorro mayor.

#### CA-HU04-01. Limite aplicado

```gherkin
Dado que el ahorro calculado supera el 35% del subtotal original
Cuando el frontend recibe limitApplied igual a true
Entonces muestra de forma persistente y distintiva
  "¡Enhorabuena! Has alcanzado el limite maximo de ahorro permitido (35%)"
Y el total final equivale al 65% del subtotal original
```

#### CA-HU04-02. Limite no aplicado

```gherkin
Dado que el ahorro calculado no supera el 35%
Cuando el frontend recibe limitApplied igual a false
Entonces no muestra la alerta de limite maximo
```

## 10. Flujos funcionales

### 10.1 Flujo principal

1. El cliente abre el catalogo.
2. El frontend obtiene y presenta los productos.
3. El cliente agrega o elimina unidades.
4. El frontend actualiza el subtotal original.
5. El cliente introduce opcionalmente un cupon y selecciona `Aplicar`.
6. El backend valida el cupon y calcula un desglose provisional.
7. El frontend presenta el desglose.
8. El cliente confirma el checkout.
9. El backend valida nuevamente productos, precios, cupon y stock.
10. El backend recalcula el desglose definitivo.
11. El backend decrementa stock y persiste la orden.
12. El frontend presenta la confirmacion y los totales definitivos.

### 10.2 Flujo alternativo: stock desactualizado

1. El cliente confirma un carrito aparentemente valido.
2. El backend detecta stock insuficiente.
3. El backend rechaza toda la operacion.
4. El frontend identifica los productos afectados.
5. El cliente actualiza cantidades antes de volver a intentar.

### 10.3 Flujo alternativo: cupon rechazado

1. El cliente aplica un cupon desconocido o expirado.
2. El backend devuelve su estado y un descuento de cupon igual a cero.
3. El frontend conserva el carrito y muestra el motivo del rechazo.
4. El cliente puede eliminar o reemplazar el codigo.

## 11. Contrato funcional propuesto

Los nombres de endpoints son propuestas y pueden adaptarse sin cambiar el comportamiento descrito.

### 11.1 Consultar catalogo

```http
GET /api/products
```

Respuesta:

```json
{
  "products": [
    {
      "id": "prod-001",
      "name": "Teclado mecanico",
      "unitPrice": 12000,
      "currency": "USD",
      "category": "Tecnologia",
      "stock": 5
    }
  ]
}
```

`unitPrice` se expresa en centavos.

### 11.2 Calcular carrito

```http
POST /api/checkout/quote
Content-Type: application/json
```

```json
{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 1
    }
  ],
  "couponCode": "WELCOME2026"
}
```

Este endpoint es opcional. Si no se implementa, el desglose puede calcularse como parte del checkout, pero la interfaz debe seguir permitiendo aplicar y visualizar el cupon antes de confirmar.

### 11.3 Confirmar checkout

```http
POST /api/checkout
Content-Type: application/json
```

```json
{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 1
    }
  ],
  "couponCode": "WELCOME2026"
}
```

Respuesta satisfactoria de referencia:

```json
{
  "orderId": "ord-001",
  "status": "CONFIRMED",
  "items": [
    {
      "productId": "prod-001",
      "name": "Teclado mecanico",
      "unitPrice": 12000,
      "quantity": 1,
      "lineAmount": 12000
    }
  ],
  "coupon": {
    "code": "WELCOME2026",
    "status": "APPLIED"
  },
  "breakdown": {
    "originalSubtotal": 12000,
    "categoryDiscount": 1200,
    "afterCategory": 10800,
    "volumeDiscount": 540,
    "afterVolume": 10260,
    "couponDiscount": 1539,
    "calculatedSavings": 3279,
    "maximumSavings": 4200,
    "finalSavings": 3279,
    "effectiveDiscountPercentage": 27.325,
    "limitApplied": false,
    "finalTotal": 8721,
    "currency": "USD"
  }
}
```

## 12. Errores funcionales propuestos

| Codigo | Condicion | Comportamiento esperado |
|---|---|---|
| `EMPTY_CART` | No hay lineas en el carrito. | Rechazar sin efectos secundarios. |
| `INVALID_QUANTITY` | Cantidad cero, negativa, decimal o fuera del rango aceptado. | Rechazar sin efectos secundarios. |
| `PRODUCT_NOT_FOUND` | El ID no pertenece al catalogo. | Rechazar sin efectos secundarios. |
| `INSUFFICIENT_STOCK` | El stock vigente es menor que la cantidad solicitada. | Rechazar toda la orden. |
| `COUPON_NOT_FOUND` | El codigo no existe. | No aplicar el descuento e informar al cliente. |
| `COUPON_EXPIRED` | El codigo existe, pero expiro. | No aplicar el descuento e informar al cliente. |
| `ORDER_PERSISTENCE_FAILED` | No se pudo persistir la orden. | No confirmar la compra; preservar la consistencia del stock. |

## 13. Ejemplos de calculo

### 13.1 Producto de Tecnologia por USD 120 con cupon

| Concepto | Calculo | Resultado |
|---|---:|---:|
| Subtotal original | USD 120.00 | USD 120.00 |
| Categoria | 10% de USD 120.00 | -USD 12.00 |
| Total tras categoria | USD 120.00 - USD 12.00 | USD 108.00 |
| Volumen | 5% de USD 108.00 | -USD 5.40 |
| Total tras volumen | USD 108.00 - USD 5.40 | USD 102.60 |
| Cupon | 15% de USD 102.60 | -USD 15.39 |
| Total final | USD 102.60 - USD 15.39 | USD 87.21 |
| Ahorro | USD 120.00 - USD 87.21 | USD 32.79 |
| Porcentaje efectivo | USD 32.79 / USD 120.00 | 27.325% |

### 13.2 Umbral exacto de volumen

Si `afterCategory` es exactamente USD 100.00, `volumeDiscount` debe ser USD 0.00 porque la condicion exige superar USD 100.

## 14. Inconsistencia funcional detectada

Con las tres reglas porcentuales actuales, el limite del 35% no puede alcanzarse.

En el caso que maximiza el descuento, todo el carrito pertenece a Tecnologia y se aplican las tres reglas:

```text
remainingFactor = 0.90 * 0.95 * 0.85
remainingFactor = 0.72675
maximumEffectiveDiscount = 1 - 0.72675
maximumEffectiveDiscount = 27.325%
```

Por lo tanto:

- `limitApplied` nunca puede ser verdadero con las reglas definidas.
- La HU-04 no puede demostrarse mediante un flujo real del MVP.
- El caso de prueba de superacion del 35% no puede construirse sin cambiar una regla o introducir una configuracion adicional.

### Decision requerida DR-01

Producto debe aprobar una de estas alternativas:

1. Agregar otra promocion acumulativa que permita superar el 35%.
2. Aumentar uno o mas porcentajes.
3. Reducir el limite por debajo de 27.325%.
4. Permitir reglas configurables y utilizar una configuracion de prueba que supere el limite.
5. Mantener las reglas y aceptar que la alerta no sea alcanzable en esta version.

No se debe modificar silenciosamente la regla original para hacer posible la demostracion.

## 15. Decisiones pendientes

| ID | Pregunta | Propuesta inicial |
|---|---|---|
| DR-01 | ¿Como se hara alcanzable el limite del 35%? | Requiere decision de producto. |
| DR-02 | ¿Cual es el catalogo inicial exacto? | Definir un conjunto fijo con categorias, precios y stock. |
| DR-03 | ¿Cuando expira `WELCOME2026`? | Definir fecha, hora y zona horaria. |
| DR-04 | ¿El codigo ignora espacios y diferencias de mayusculas? | Recortar espacios y normalizar a mayusculas. |
| DR-05 | ¿Como se redondea el dinero? | Centavos enteros y `ROUND_HALF_UP` por etapa. |
| DR-06 | ¿Como se procesan IDs repetidos en una solicitud? | Consolidar cantidades antes de validar stock. |
| DR-07 | ¿Cual es la cantidad maxima por linea? | Definir un limite positivo y verificable. |
| DR-08 | ¿Como se evita duplicar una compra por reintento? | Admitir una clave de idempotencia. |
| DR-09 | ¿Que persistencia se usara? | SQLite para conservar ordenes entre reinicios. |
| DR-10 | ¿Como se garantiza atomicidad entre stock y orden? | Utilizar una transaccion de persistencia. |

## 16. Casos minimos de prueba de aceptacion

| ID | Escenario | Resultado principal |
|---|---|---|
| PA-01 | Carrito con producto no tecnologico, total menor a USD 100 y sin cupon. | Ningun descuento. |
| PA-02 | Carrito con producto de Tecnologia y sin cupon. | Solo 10% sobre las lineas de Tecnologia. |
| PA-03 | Total tras categoria exactamente USD 100. | No se aplica volumen. |
| PA-04 | Total tras categoria de USD 100.01. | Se aplica 5% de volumen. |
| PA-05 | Cupon valido sin descuento de categoria ni volumen. | Se aplica 15% al total correspondiente. |
| PA-06 | Cupon desconocido. | Descuento de cupon igual a cero y mensaje explicativo. |
| PA-07 | Cupon expirado. | Descuento de cupon igual a cero y mensaje explicativo. |
| PA-08 | Todos los descuentos aplicables. | Orden secuencial correcto y desglose completo. |
| PA-09 | Carrito vacio. | Checkout rechazado sin efectos secundarios. |
| PA-10 | Cantidad negativa, decimal o cero. | Solicitud rechazada. |
| PA-11 | Producto inexistente. | Solicitud rechazada. |
| PA-12 | Una linea sin stock suficiente. | Toda la orden rechazada y stock intacto. |
| PA-13 | Precios manipulados desde el cliente. | El backend utiliza los precios vigentes. |
| PA-14 | Falla al persistir la orden. | No se confirma la compra ni queda el stock parcialmente actualizado. |
| PA-15 | Calculo que supera el limite. | Pendiente de DR-01; debe truncar al 35% y activar la alerta. |

## 17. Matriz de trazabilidad

| Historia | Requisitos relacionados | Criterios | Pruebas |
|---|---|---|---|
| HU-01 | RF-CAT-01 a RF-CAT-03; RF-CAR-01 a RF-CAR-07 | CA-HU01-01 a CA-HU01-04 | PA-01, PA-09, PA-10, PA-11, PA-12 |
| HU-02 | RF-CUP-01 a RF-CUP-04; RF-DES-01 a RF-DES-04 | CA-HU02-01, CA-HU02-02 | PA-02 a PA-08, PA-13 |
| HU-03 | RF-CHK-01 a RF-CHK-09 | CA-HU03-01 a CA-HU03-04 | PA-09 a PA-14 |
| HU-04 | RF-UI-01 a RF-UI-04; RN-05 | CA-HU04-01, CA-HU04-02 | PA-15 |

## 18. Restricciones tecnicas y de entrega

Estos elementos proceden del enunciado, pero no son requisitos funcionales del producto:

- Repositorio publico de GitHub.
- Estructura de monorepo con frontend y backend.
- Frontend implementado con React o Angular.
- Comunicacion REST o una alternativa justificada.
- Tipado estricto de extremo a extremo.
- Separacion modular de responsabilidades.
- Implementacion explicita de al menos dos patrones de diseno.
- Aislamiento del motor de descuentos respecto de controladores y persistencia.
- Cobertura minima del 80% en las capas logicas esenciales de frontend y backend.
- Pruebas de casos de borde.
- Archivo `docs/arquitectura.md`.
- Archivo `docs/ia.md`.
- `README.md` con instalacion, configuracion y comandos de pruebas.
- Historial de commits descriptivo e incremental.
- Sustentacion de 20 minutos.

## 19. Definition of Done funcional

El MVP se considera funcionalmente terminado cuando:

- Todos los requisitos de prioridad alta estan implementados o tienen una excepcion aprobada.
- Todos los criterios de aceptacion ejecutables pasan.
- El backend recalcula y valida cada checkout.
- Las operaciones fallidas no producen actualizaciones parciales.
- El frontend presenta el desglose autoritativo.
- La politica monetaria esta definida y cubierta por pruebas.
- Las decisiones pendientes que bloquean pruebas han sido resueltas.
- Existe evidencia automatizada para los casos de borde.
- La matriz de trazabilidad esta actualizada.

