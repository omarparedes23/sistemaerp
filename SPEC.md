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

---

# Especificación: Módulo de Ventas y Clientes (Fase 3)

## Entidades de Datos

### 1. Clientes (`clients`)
- `id`, `type` (DNI / RUC / Otros), `number` (único), `name`, `address`, `email`, `phone`, `created_at`.
- El número de documento es único en el sistema (constraint `UNIQUE`).

### 2. Cabecera de Venta (`sales_header`)
- `id`, `client_id`, `warehouse_id`, `doc_type` (Factura / Boleta), `series`, `number`, `status` (Paid / Annulled).
- Totales: `subtotal` (sin IGV), `tax_total` (IGV 18%), `total`.
- Correlativo único por: `(doc_type, series, number)`.

### 3. Detalle de Venta (`sales_items`)
- `id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `total_line`.
- `total_line = quantity × unit_price` (calculado en la app antes de insertar).

## Lógica de Negocio — Automatización de Stock

### Venta (Emisión de Comprobante)
- Al insertar un ítem en `sales_items`, el trigger `fn_create_movement_on_sale` genera automáticamente un movimiento **OUT / SALE** en `inventory_movements`.
- `document_ref` toma el valor `"Factura F001-00001"` (o Boleta, según tipo).
- El trigger de stock `fn_update_stock_on_movement` reacciona al OUT y descuenta el inventario.

### Nota de Crédito (Anulación parcial o total)
- Al **eliminar** ítems de `sales_items` (anulación), el mismo trigger genera un movimiento **IN / SALE** con prefijo `"NC: "` en `document_ref`.
- Esto restaura el stock automáticamente sin intervención manual.

### Totales y IGV
- La app calcula: `subtotal = Σ(quantity × unit_price)`, `tax_total = subtotal × 0.18`, `total = subtotal + tax_total`.
- Estos valores se persisten en `sales_header` al momento de guardar.

## Flujos de Usuario

1. **CRUD de Clientes:** Listar, crear, editar y eliminar clientes con validación de tipo + número de documento.
2. **Nueva Venta:** Formulario Maestro-Detalle: seleccionar cliente, almacén, tipo de comprobante y agregar productos con precio y cantidad. Al guardar, el trigger maneja el stock.
3. **Gestión de Correlativos:** Tabla para controlar la serie y número correlativo por tipo de comprobante.
4. **Anulación:** Cambiar `status` a `Annulled` y eliminar los ítems para que el trigger devuelva el stock.