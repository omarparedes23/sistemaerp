# Sistema ERP Modular (Core)

## Visión General
Un sistema de planificación de recursos empresariales (ERP) moderno, diseñado para ser modular, escalable y auditado. El primer objetivo es la gestión de inventarios y ventas para el sector automotriz.

## Principios del Sistema
- **Integridad de Stock:** El stock nunca se edita manualmente. Todo cambio en el inventario debe estar respaldado por un registro en la tabla de movimientos.
- **Auditoría:** Cada registro debe tener `created_at`, `updated_at` y el ID del usuario que realizó la acción.
- **Multimoneda:** Manejo nativo de Soles (PEN) y Dólares (USD).
- **Escalabilidad:** El módulo de Almacenes es el núcleo; Ventas, Contabilidad y Cuentas Corrientes se acoplarán a este.

## Reglas de Negocio Globales
1. Un producto puede existir en múltiples almacenes.
2. Los documentos (Facturas, Guías) son los que disparan los movimientos de inventario.
3. Identificación Única: Todo producto debe tener un SKU (caCodigo) que facilite la búsqueda por compatibilidad de piezas