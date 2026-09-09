# Nova Market UI Preview

Prototipo visual independiente para el checkout de e-commerce. Utiliza React,
TypeScript y Tailwind CSS. Todos los datos son simulados y los componentes se
controlan mediante props; no existen llamadas a APIs.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir `http://127.0.0.1:4173`.

## Verificar

```bash
npm run typecheck
npm run build
```

## Componentes

- `ProductGrid`: catálogo y controles de cantidad.
- `CartCheckoutPanel`: líneas seleccionadas, cupón y confirmación.
- `TotalsBreakdown`: resumen autoritativo inyectado por props.
- `DiscountLimitBanner`: alerta condicional con el texto requerido.

`App.tsx` es únicamente un harness de previsualización con estado y datos mock.
La futura aplicación productiva podrá conectar los mismos contratos al store y
al backend sin introducir llamadas de red en los componentes visuales.
