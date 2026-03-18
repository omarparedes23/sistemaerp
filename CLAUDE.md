# Instrucciones para Claude Code

## Convenciones de Código
- Usa **Server Components** por defecto para lectura de datos.
- Usa **Server Actions** para mutaciones (inserts/updates).
- Nombres de tablas y columnas en inglés y en `snake_case`.
- Interfaz de usuario en **Español**.
- Implementa validaciones de formularios usando **Zod**.

## Preferencias de Supabase
- Generar scripts de migración SQL para cada cambio en la DB (`migration_*.sql`).
- No uses lógica de cálculo de stock en el frontend; delega a los Triggers de la DB.
- El trigger `fn_update_stock_on_movement` maneja **INSERT, UPDATE y DELETE** sobre `inventory_movements` y recalcula `stock_levels` automáticamente.

## Referencia de Base de Datos
- Consulta siempre `DATABASE.sql` para conocer la estructura de tablas y triggers antes de generar queries o tipos.
- No intentes modificar la DB directamente; si necesitas un cambio, genera el SQL de migración para que el usuario lo ejecute en Supabase.

## Compatibilidad de Tipos Supabase
- `@supabase/supabase-js` v2.99+ requiere que `Database["public"]` incluya `Views`, `Functions` y `CompositeTypes` con el patrón `{ [_ in never]: never }`.
- Cada tabla debe incluir `Relationships: [...]` con los FKs reales para que Supabase resuelva los JOINs tipados.
- Si hay errores de tipo `Insert = never`, actualizar `@supabase/ssr` a la última versión: `npm install @supabase/ssr@latest`.

## Patrones de Server Actions con ID (updateX, deleteX)
- Usar `.bind(null, id)` en el Server Component para pasar el ID antes de entregar la acción a `useActionState` en el Client Component.
- Ejemplo: `const boundAction = updateIngreso.bind(null, movId);`

## Módulo de Ingresos — Estructura
- **Crear**: `/almacenes/ingresos/nuevo` → `IngresoForm` en modo `create`.
- **Editar**: `/almacenes/ingresos/[id]/editar` → `IngresoForm` en modo `edit` con `serverAction` y `initialData`.
- `IngresoForm` acepta `mode`, `initialData` y `serverAction` para reutilización en ambos casos.
- `unit_cost` es obligatorio en cada ítem del ingreso (costo unitario al momento del movimiento).

## Módulo de Ventas — Estructura
- **Listado**: `/ventas` → `VentasPage` (Server Component, tabla de comprobantes).
- **Crear**: `/ventas/nueva` → `SaleForm` — formulario maestro-detalle.
- **Clientes**: `/ventas/clientes` → CRUD con `ClientDialog`.
- **Correlativos**: `/ventas/correlativos` → CRUD con `SequenceDialog`.

## Módulo de Ventas — Lógica de IGV
- **Factura**: precios SIN IGV. `subtotal = Σ(qty × price)`, `tax_total = subtotal × 0.18`, `total = subtotal + tax_total`.
- **Boleta**: precios CON IGV incluido. `total = Σ(qty × price)`, `subtotal = total / 1.18`, `tax_total = total − subtotal`.
- Redondear siempre a 2 decimales usando `Math.round(x * 100) / 100`.

## Módulo de Ventas — Validación de Stock
- Antes de insertar en `sales_header`, la Server Action `createSale` consulta `stock_levels` para el `warehouse_id` seleccionado y verifica que cada ítem tenga stock suficiente.
- Si falla, retorna error con nombre del producto y stock disponible.
- El formulario (`SaleForm`) también valida client-side con el `stockMap` precargado y deshabilita el botón "Emitir" mientras haya ítems con stock insuficiente.

## Módulo de Ventas — Correlativos
- `document_sequences`: tabla `(doc_type, series, current_number, is_automatic, is_active)`.
- `is_automatic = true`: el formulario sugiere `current_number + 1` y bloquea el campo. Al guardar llama a `bumpSequenceNumber(sequenceId)`.
- `is_automatic = false`: el usuario escribe el número manualmente (contingencia / talonarios físicos).

## Módulo de Ventas — Flujo del Trigger
- Al insertar en `sales_items` → trigger `fn_create_movement_on_sale` genera un movimiento `OUT / SALE` automáticamente en `inventory_movements`.
- Al eliminar ítems (anulación) → el mismo trigger genera un movimiento `IN / SALE` con prefijo `"NC: "`.
- Nunca insertar en `inventory_movements` directamente desde la Server Action de ventas.
