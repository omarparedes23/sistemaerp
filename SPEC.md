# Especificación: Módulo de Almacenes (V1)

## Conceptos Clave
- **SKU (caCodigo):** Identificador único comercial del producto (ej: 'REP-123').
- **Almacén (Warehouse):** Ubicación física donde se custodia la mercadería.
- **Movimiento:** Cualquier transacción que afecte el stock físico (compra, venta, ajuste).

## Entidades de Datos

### 1. Catálogo
- **categories / brands / units:** Tablas maestras para clasificar productos.
- **products:** El maestro de artículos.
    - `id`, `sku`, `name`, `description`, `brand_id`, `category_id`, `unit_id`.

### 2. Inventario
- **warehouses:** Lista de locales o depósitos.
- **stock_levels:** Tabla de saldos en tiempo real.
    - Mantiene el conteo actual de cada producto en cada almacén.
- **inventory_movements:** El historial de auditoría.
    - `type`: 'IN' (Ingreso) o 'OUT' (Salida).
    - `reason`: PURCHASE, SALE, ADJUSTMENT, INVENTORY_COUNT, INITIAL_LOAD, TRANSFER.

## Lógica de Negocio (Automatización)
- **Stock Automatizado:** El usuario NUNCA edita la tabla `stock_levels`. 
- Al insertar un registro en `inventory_movements`, un **Trigger de Base de Datos** actualiza automáticamente el saldo en `stock_levels`.
- Si el producto no existe en ese almacén todavía, el Trigger crea el registro inicial.

## Flujos de Usuario
1. **Ingreso de Mercadería:** Formulario para registrar compras o importaciones. Genera movimientos 'IN'.
2. **Ajuste / Inventario:** Opción para corregir desfases. El usuario indica la cantidad real y el sistema genera el movimiento de ajuste necesario (IN o OUT) para cuadrar el stock.
3. **Consulta de Existencias:** Tabla con filtros por almacén y búsqueda por SKU o Nombre.