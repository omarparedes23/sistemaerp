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
