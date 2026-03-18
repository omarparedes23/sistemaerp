# Instrucciones para Claude Code

## Convenciones de Código
- Usa **Server Components** por defecto para lectura de datos.
- Usa **Server Actions** para mutaciones (inserts/updates).
- Nombres de tablas y columnas en inglés y en `snake_case`.
- Interfaz de usuario en **Español**.
- Implementa validaciones de formularios usando **Zod**.

## Preferencias de Supabase
- Generar scripts de migración SQL para cada cambio en la DB.
- No uses lógica de cálculo de stock en el frontend; delega a los Triggers de la DB que definiremos en `SPEC.md`.
## Referencia de Base de Datos
- Consulta siempre `DATABASE.sql` para conocer la estructura de tablas y triggers antes de generar queries o tipos.
- No intentes modificar la DB directamente; si necesitas un cambio, sugiere el SQL para que yo lo ejecute.