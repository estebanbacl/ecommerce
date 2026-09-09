# Historias de usuario - Core E-Commerce Checkout

## Control del documento

| Campo | Valor |
|---|---|
| Estado del documento | Revisado |
| Fecha de revisión | 2026-09-08 |
| Especificación de referencia | [`especificacion-producto.md`](./especificacion-producto.md) |
| Alcance | Madurez de la especificación, criterios de aceptación, dependencias y trabajo futuro |

> Este documento evalúa la calidad y completitud de las historias como especificaciones. No representa avance de implementación y no presupone que las aplicaciones frontend o backend ya existan.

## 1. Convención de estados

| Estado | Significado dentro de la fase de especificación |
|---|---|
| Borrador | La intención está descrita, pero faltan reglas o criterios verificables. |
| Especificada | La historia tiene alcance, reglas, criterios de aceptación, dependencias y pruebas previstas. |
| Lista para desarrollo | La historia está especificada y todas sus decisiones bloqueantes fueron resueltas. |
| Bloqueada | Existe una ambigüedad o decisión de producto que impide declararla lista para desarrollo. |
| Aprobada | Producto, desarrollo y QA validaron formalmente la historia. |

## 2. Estado de las especificaciones

| Historia | Estado | Cobertura de la especificación | Pendiente para declararla lista para desarrollo |
|---|---|---|---|
| HU-01 - Gestión del carrito | Especificada | Incluye precondiciones, reglas, cinco criterios de aceptación, dependencias y pruebas previstas. | Aprobar el catálogo inicial y el contrato de productos. |
| HU-02 - Cupón y desglose | Especificada | Incluye precedencia, estados del cupón, umbral de volumen, vigencia del cálculo y pruebas previstas. | Aprobar la política monetaria y la vigencia/normalización del cupón. |
| HU-03 - Procesamiento de la orden | Especificada | Incluye validaciones, atomicidad, fuente de verdad, errores, persistencia y pruebas previstas. | Aprobar persistencia, atomicidad e idempotencia. |
| HU-04 - Alerta de límite | Bloqueada | El comportamiento de la alerta está especificado, pero el escenario no es alcanzable con las reglas actuales. | Resolver DR-01: el descuento máximo posible es 27.325%, inferior al tope del 35%. |

## 3. HU-01 - Gestión del carrito

### Estado

**Especificada.** Pendiente de aprobar el catálogo inicial y el contrato de productos para declararla lista para desarrollo.

### Historia

Como cliente de la tienda, quiero consultar los productos disponibles y agregarlos, reducirlos o eliminarlos de un carrito para construir mi compra y conocer inmediatamente el subtotal original.

### Requisitos relacionados

- RF-CAT-01 a RF-CAT-03.
- RF-CAR-01 a RF-CAR-07.
- RN-01 y RN-07.

### Precondiciones y reglas

- Existe un catálogo con ID, nombre, precio unitario, categoría y stock.
- El frontend obtiene el catálogo desde el backend.
- El subtotal es la suma de `precio unitario x cantidad` de todas las líneas.
- Una línea activa tiene una cantidad entera mayor que cero.
- La interfaz no acepta una cantidad superior al stock conocido.
- El backend continúa siendo la fuente de verdad para precio y stock.

### Criterios de aceptación

#### CA-HU01-01 - Mostrar catálogo

```gherkin
Dado que existen productos preconfigurados
Cuando el cliente abre la aplicación
Entonces ve la lista de productos
Y cada producto muestra ID, nombre, precio unitario, categoría y stock disponible
```

#### CA-HU01-02 - Agregar e incrementar un producto

```gherkin
Dado un producto con stock disponible
Cuando el cliente agrega una unidad al carrito
Entonces aparece una línea correspondiente al producto
Y si vuelve a agregarlo se incrementa la cantidad de la misma línea
Y el subtotal original se actualiza inmediatamente
```

#### CA-HU01-03 - Reducir o eliminar un producto

```gherkin
Dado que una línea tiene unidades en el carrito
Cuando el cliente reduce su cantidad
Entonces la cantidad y el subtotal se recalculan
Y al eliminar la última unidad la línea desaparece
```

#### CA-HU01-04 - Impedir superar el stock conocido

```gherkin
Dado que la cantidad del carrito es igual al stock conocido
Cuando el cliente intenta agregar otra unidad
Entonces la cantidad no aumenta
Y se muestra una explicación visible
```

#### CA-HU01-05 - Carrito vacío

```gherkin
Dado que el cliente elimina la última línea
Cuando el carrito queda vacío
Entonces el subtotal mostrado es USD 0.00
Y la acción de confirmar la compra está deshabilitada
```

### Detalles necesarios para implementarla

#### Backend

- Crear la entidad `Product` con ID, nombre, precio en centavos, categoría y stock.
- Crear un repositorio con productos iniciales deterministas.
- Exponer `GET /api/products` mediante un contrato de respuesta propio.

#### Frontend

- Crear los tipos `Product`, `CartItem` y la respuesta de catálogo.
- Crear el cliente HTTP y estados de carga, éxito, vacío y error.
- Crear componentes de producto y resumen del carrito.
- Extraer el estado del carrito a un hook, reducer o store comprobable aisladamente.
- Implementar agregar, incrementar, reducir y eliminar líneas.
- Calcular el subtotal provisional en centavos.
- Informar de forma accesible cuando se alcance el stock conocido.

#### Pruebas mínimas

- Mostrar los datos del catálogo.
- Agregar e incrementar un producto.
- Reducir y eliminar una línea.
- Recalcular el subtotal después de cada operación.
- Rechazar cantidades cero, negativas, decimales o superiores al stock conocido.
- Mostrar estados de carga y error.

### Dependencias

- Catálogo inicial definido.
- Contrato de `GET /api/products`.

### Definition of Done

- Todos los criterios CA-HU01 pasan.
- El estado del carrito está desacoplado de la presentación.
- Los importes se manejan en centavos sin errores de punto flotante.
- Las pruebas del estado y las validaciones participan en la cobertura.

## 4. HU-02 - Aplicación dinámica de cupón y visualización de desglose

### Estado

**Especificada.** Pendiente de aprobar la política monetaria y las reglas de vigencia y normalización de cupones.

### Historia

Como cliente, quiero ingresar un cupón y solicitar su aplicación para visualizar el descuento de categoría, volumen y cupón, el porcentaje efectivo, el ahorro total y el valor final a pagar.

### Requisitos relacionados

- RF-CUP-01 a RF-CUP-04.
- RF-DES-01 a RF-DES-04.
- RN-02 a RN-07.

### Precondiciones y reglas

- HU-01 permite construir un carrito no vacío.
- Existe un contrato del backend para calcular el carrito.
- `WELCOME2026` está registrado y activo.
- Se aplica 10% únicamente sobre las líneas de categoría `Tecnología`.
- Se aplica 5% sobre el total posterior a categoría solo si supera estrictamente USD 100.
- Se aplica 15% sobre el total posterior a volumen si el cupón es válido.
- El límite consolidado se evalúa al final.
- El desglose del backend es el resultado autoritativo.

### Criterios de aceptación

#### CA-HU02-01 - Aplicar cupón válido

```gherkin
Dado un carrito no vacío
Y que WELCOME2026 está activo
Cuando el cliente ingresa WELCOME2026 y selecciona Aplicar
Entonces el sistema informa que el cupón fue aceptado
Y muestra el subtotal original
Y muestra los descuentos de categoría, volumen y cupón
Y muestra el ahorro total, porcentaje efectivo y total final
```

#### CA-HU02-02 - Rechazar cupón desconocido o expirado

```gherkin
Dado un carrito no vacío
Cuando el cliente aplica un cupón desconocido o expirado
Entonces el sistema informa por qué no fue aceptado
Y el descuento por cupón es cero
Y conserva los descuentos que no dependen del cupón
```

#### CA-HU02-03 - Respetar la precedencia

```gherkin
Dado un carrito que cumple las reglas de categoría y volumen
Y el cupón WELCOME2026
Cuando se solicita el cálculo
Entonces el descuento de categoría se calcula primero
Y volumen usa como base el total posterior a categoría
Y cupón usa como base el total posterior a volumen
```

#### CA-HU02-04 - Respetar el umbral de volumen

```gherkin
Dado que el total posterior a categoría es exactamente USD 100.00
Cuando se calcula el carrito
Entonces el descuento por volumen es USD 0.00
```

#### CA-HU02-05 - Invalidar una cotización anterior

```gherkin
Dado que existe un desglose visible
Cuando el cliente cambia el contenido del carrito
Entonces el desglose anterior se marca como desactualizado o se vuelve a solicitar
Y no se presenta una cotización anterior como vigente
```

### Detalles necesarios para implementarla

#### Backend

- Crear modelos de entrada para IDs, cantidades y cupón.
- Crear `PricingBreakdown` con subtotales, descuentos, ahorro, porcentaje, límite y total final.
- Implementar reglas de descuento desacopladas y ordenadas explícitamente.
- Validar cupones con estados `APPLIED`, `NOT_FOUND` y `EXPIRED`.
- Crear un caso de uso de cotización, por ejemplo `POST /api/checkout/quote`.
- Recuperar precios y categorías desde el catálogo, no desde la solicitud.
- Definir y aplicar una política única de redondeo monetario.

#### Frontend

- Crear el formulario de cupón y el botón `Aplicar`.
- Deshabilitarlo con carrito vacío o durante una solicitud activa.
- Mostrar los estados aplicando, aplicado, inválido, expirado y error técnico.
- Crear un componente de desglose que muestre todos los conceptos, incluso los de valor cero.
- Invalidar o recalcular el desglose al modificar el carrito.
- Formatear centavos en USD únicamente en la presentación.

#### Pruebas mínimas

- Carrito sin descuentos y con cada descuento individual.
- Total posterior a categoría de USD 100.00 y USD 100.01.
- Cupón válido, desconocido y expirado.
- Reglas aplicadas en el orden correcto.
- Carrito mixto: categoría solo afecta productos de Tecnología.
- Redondeo con fracciones de centavo.
- Invalidación del desglose al cambiar el carrito.

### Dependencias

- HU-01.
- Dominio de productos del backend.
- Política monetaria y de redondeo aprobada.
- Fecha, hora y zona de expiración de cupones definidas.

### Definition of Done

- Todos los criterios CA-HU02 pasan.
- El backend contiene una única implementación autoritativa del motor.
- El frontend no duplica reglas de descuentos como fuente de verdad.
- Los casos de borde participan en el reporte de cobertura.

## 5. HU-03 - Procesamiento consistente de la orden

### Estado

**Especificada.** Pendiente de aprobar persistencia, atomicidad e idempotencia.

### Historia

Como sistema de checkout, quiero recibir el carrito y el cupón, validar el stock vigente, recalcular los descuentos, decrementar el inventario, persistir la orden y devolver la confirmación para evitar compras inconsistentes.

### Requisitos relacionados

- RF-CHK-01 a RF-CHK-09.
- RN-01 a RN-07.

### Precondiciones y reglas

- Existe un catálogo autoritativo y un repositorio de órdenes.
- El motor de descuentos está implementado y probado.
- La solicitud contiene identificadores, cantidades y cupón opcional.
- El backend obtiene precio, categoría, stock y estado del cupón desde sus fuentes.
- Los IDs repetidos se consolidan antes de validar el stock.
- La orden solo se confirma si todas las líneas son válidas.
- El decremento de stock y la persistencia forman una sola operación lógica.
- Un fallo no puede producir decrementos parciales.

### Criterios de aceptación

#### CA-HU03-01 - Confirmar una orden válida

```gherkin
Dado que todos los productos existen y tienen stock suficiente
Cuando el backend procesa el checkout
Entonces recupera los datos vigentes del catálogo
Y recalcula los descuentos en el orden establecido
Y decrementa el stock solicitado
Y persiste una orden confirmada
Y devuelve el identificador y el desglose definitivo
```

#### CA-HU03-02 - Rechazar stock insuficiente sin efectos parciales

```gherkin
Dado un carrito con varias líneas
Y que al menos una no tiene stock suficiente
Cuando se procesa el checkout
Entonces se rechaza toda la operación
Y se identifican las líneas afectadas
Y el stock de todos los productos permanece intacto
Y no se persiste una orden confirmada
```

#### CA-HU03-03 - Rechazar carrito vacío o datos corruptos

```gherkin
Dado que el carrito está vacío o contiene un producto o cantidad inválidos
Cuando se procesa el checkout
Entonces se rechaza con un código estable de validación
Y no se modifica el inventario
Y no se persiste una orden confirmada
```

#### CA-HU03-04 - Ignorar precios manipulados

```gherkin
Dado que un cliente envía un precio o total diferente al del catálogo
Cuando se procesa el checkout
Entonces el backend ignora ese valor
Y utiliza el precio vigente del producto
```

#### CA-HU03-05 - Revertir ante fallo de persistencia

```gherkin
Dado que todos los datos son válidos
Y ocurre un error al persistir la orden
Cuando se procesa el checkout
Entonces la orden no se confirma
Y el stock no queda parcialmente actualizado
Y se devuelve un error controlado
```

#### CA-HU03-06 - Recalcular al confirmar

```gherkin
Dado que el cliente recibió previamente una cotización
Y algún precio, stock o estado del cupón cambió
Cuando confirma el checkout
Entonces el backend vuelve a validar y calcular
Y devuelve los valores definitivos
```

### Detalles necesarios para implementarla

#### Dominio y aplicación

- Reemplazar o aislar el ejemplo actual de usuarios para no confundirlo con el dominio del producto.
- Crear entidades o value objects para producto, línea de orden, cupón, desglose y orden.
- Crear puertos para catálogo/inventario, cupones y órdenes.
- Implementar `Checkout` como orquestador de validación, cálculo y persistencia.
- Mantener el motor de descuentos libre de HTTP y persistencia.
- Definir errores estables: `EMPTY_CART`, `INVALID_QUANTITY`, `PRODUCT_NOT_FOUND`, `INSUFFICIENT_STOCK`, `COUPON_NOT_FOUND`, `COUPON_EXPIRED` y `ORDER_PERSISTENCE_FAILED`.

#### Adaptadores e infraestructura

- Exponer `POST /api/checkout`.
- Validar JSON, campos obligatorios, tipos y límites de cantidad.
- Implementar inventario y órdenes con exclusión mutua o transacción según la persistencia elegida.
- Generar un ID de orden y guardar una instantánea de productos, precios y desglose.
- Mapear errores de dominio a estados HTTP consistentes.
- Considerar una clave de idempotencia para evitar órdenes duplicadas por reintentos.

#### Pruebas mínimas

- Checkout satisfactorio con actualización exacta del stock.
- Stock insuficiente en la primera y en una línea posterior.
- Carrito vacío, producto inexistente y cantidades inválidas.
- IDs repetidos cuya cantidad consolidada supera el stock.
- Precios o totales manipulados por el cliente.
- Cupón inválido o expirado.
- Error al persistir sin actualización parcial del stock.
- Dos intentos concurrentes sobre el último stock disponible.
- Respuesta con todos los campos del desglose.

### Dependencias

- Dominio de productos e inventario.
- Motor definido en HU-02.
- Estrategia de persistencia, atomicidad e idempotencia.

### Definition of Done

- Todos los criterios CA-HU03 pasan.
- Ninguna ruta confirma una orden utilizando precios del cliente.
- Las pruebas demuestran que los errores no dejan estado parcial.
- El endpoint y sus errores están documentados.
- Las pruebas de descuentos, stock y checkout participan en la cobertura.

## 6. HU-04 - Alerta de descuento límite alcanzado

### Estado

**Bloqueada por una decisión de producto.** El comportamiento está especificado, pero el escenario no es alcanzable con las reglas vigentes.

### Historia

Como cliente, quiero recibir una notificación persistente cuando el descuento sea limitado para comprender por qué no se aplica un ahorro mayor.

### Requisitos relacionados

- RF-UI-01 a RF-UI-04.
- RN-05.
- DR-01 de la especificación de producto.

### Bloqueo funcional

Con todas las reglas actuales aplicadas al caso de mayor descuento:

```text
total restante = 0.90 x 0.95 x 0.85 = 0.72675
descuento efectivo máximo = 1 - 0.72675 = 27.325%
```

El 27.325% es menor que el límite del 35%. Ningún carrito válido puede producir `limitApplied = true`; la historia no puede demostrarse de extremo a extremo sin resolver DR-01.

Producto debe aprobar una alternativa:

1. Agregar otra promoción acumulativa.
2. Aumentar uno o más porcentajes.
3. Reducir el límite por debajo de 27.325%.
4. Permitir reglas configurables y usar una configuración de prueba que supere el límite.
5. Mantener las reglas y aceptar formalmente que la alerta no sea alcanzable en esta versión.

No debe modificarse silenciosamente una regla para hacer alcanzable la historia.

### Precondiciones

- DR-01 está resuelta.
- El backend devuelve `limitApplied`, `maximumSavings`, `finalSavings` y `finalTotal`.
- HU-02 presenta un desglose vigente.

### Criterios de aceptación

#### CA-HU04-01 - Mostrar alerta cuando se aplica el límite

```gherkin
Dado que el ahorro calculado supera el máximo configurado
Cuando el frontend recibe limitApplied igual a true
Entonces muestra de forma persistente y visualmente distintiva
  "¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido (35%)"
Y el total final equivale al 65% del subtotal original
```

#### CA-HU04-02 - No mostrar alerta sin truncamiento

```gherkin
Dado que el ahorro calculado no supera el máximo configurado
Cuando el frontend recibe limitApplied igual a false
Entonces no muestra la alerta de límite
```

#### CA-HU04-03 - Actualizar la alerta con la cotización

```gherkin
Dado que la alerta está visible
Cuando el cliente modifica el carrito
Entonces la alerta permanece solo si el nuevo cálculo devuelve limitApplied igual a true
```

### Detalles necesarios para implementarla

#### Backend

- Calcular el ahorro sin tope antes de aplicar el máximo.
- Compararlo con el ahorro máximo y truncarlo exactamente cuando corresponda.
- Devolver `limitApplied`; el frontend no debe inferirlo de un porcentaje redondeado.
- Conservar `maximumSavings` y `finalSavings` en el desglose.

#### Frontend

- Crear una alerta accesible con `role="status"` o `role="alert"` según el comportamiento elegido.
- Renderizarla exclusivamente cuando `limitApplied` sea verdadero.
- Mantenerla visible mientras el desglose siga vigente.
- Ocultarla o actualizarla después de un nuevo cálculo.

#### Pruebas mínimas

- El motor trunca un descuento superior al límite exactamente al máximo.
- El backend devuelve `limitApplied = true` únicamente cuando hubo truncamiento.
- La alerta aparece con `limitApplied = true` y no aparece con `false`.
- La alerta persiste sin cambios y se actualiza después de una nueva cotización.
- El texto y la semántica accesible pueden localizarse en pruebas de UI.

### Dependencias

- Resolución de DR-01.
- HU-02 y HU-03.

### Definition of Done

- DR-01 está documentada y resuelta.
- Todos los criterios CA-HU04 ejecutables pasan.
- Existe una prueba de dominio que fuerza un valor superior al límite.
- Existe una prueba de UI para cada estado de la alerta.

## 7. Orden recomendado para preparar el backlog

1. Aprobar catálogo, política monetaria, persistencia y DR-01.
2. Validar los contratos propuestos con frontend y backend.
3. Declarar HU-01 lista para desarrollo.
4. Declarar HU-02 lista cuando sus decisiones de cupones y dinero estén cerradas.
5. Declarar HU-03 lista cuando atomicidad, persistencia e idempotencia estén definidas.
6. Mantener HU-04 bloqueada hasta resolver cómo puede alcanzarse el límite.
7. Obtener la aprobación conjunta de producto, desarrollo y QA.

## 8. Regla para actualizar estados de especificación

Una historia se marca como `Especificada` cuando posee alcance, reglas, criterios verificables, dependencias y pruebas previstas. Solo puede pasar a `Lista para desarrollo` cuando sus decisiones bloqueantes estén resueltas. La aprobación final debe involucrar a producto, desarrollo y QA; el seguimiento de implementación deberá realizarse posteriormente en el backlog o herramienta de gestión, no en este documento de especificación.
