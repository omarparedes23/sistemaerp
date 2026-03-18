-- ═══════════════════════════════════════════════════════════════════════════════
-- ESQUEMA COMPLETO — ERP Modular
-- Última actualización: 2026-03-18
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Tablas de Clasificación
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- ej: Unidades, Litros, Kilos
    abbreviation TEXT NOT NULL  -- ej: UND, LTS, KGS
);

-- 2. Maestro de Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE, -- Identificador comercial único
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    brand_id INTEGER REFERENCES brands(id),
    unit_id INTEGER REFERENCES units(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Almacenes
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Niveles de Stock (Saldos actuales — calculados por trigger)
CREATE TABLE stock_levels (
    product_id INTEGER REFERENCES productos(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    current_stock DECIMAL(12,2) DEFAULT 0,
    PRIMARY KEY (product_id, warehouse_id)
);

-- 5. Historial de Movimientos
CREATE TYPE movement_type AS ENUM ('IN', 'OUT');
CREATE TYPE movement_reason AS ENUM (
    'PURCHASE', 'SALE', 'ADJUSTMENT',
    'INVENTORY_COUNT', 'INITIAL_LOAD', 'TRANSFER'
);

CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES productos(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    quantity DECIMAL(12,2) NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0, -- Costo unitario al momento del movimiento
    type movement_type NOT NULL,
    reason movement_reason NOT NULL,
    document_ref TEXT,             -- Referencia a Factura, Guía o Ticket
    user_id UUID DEFAULT auth.uid(), -- ID del usuario en Supabase Auth
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Trigger para actualizar stock automáticamente en INSERT, UPDATE y DELETE
CREATE OR REPLACE FUNCTION fn_update_stock_on_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- ── INSERT: sumar el nuevo movimiento ────────────────────────────────────
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO stock_levels (product_id, warehouse_id, current_stock)
        VALUES (NEW.product_id, NEW.warehouse_id, 0)
        ON CONFLICT (product_id, warehouse_id) DO NOTHING;

        IF (NEW.type = 'IN') THEN
            UPDATE stock_levels
            SET current_stock = current_stock + NEW.quantity
            WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
        ELSIF (NEW.type = 'OUT') THEN
            UPDATE stock_levels
            SET current_stock = current_stock - NEW.quantity
            WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
        END IF;

    -- ── UPDATE: revertir OLD y aplicar NEW ───────────────────────────────────
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Revertir el movimiento anterior
        IF (OLD.type = 'IN') THEN
            UPDATE stock_levels
            SET current_stock = current_stock - OLD.quantity
            WHERE product_id = OLD.product_id AND warehouse_id = OLD.warehouse_id;
        ELSIF (OLD.type = 'OUT') THEN
            UPDATE stock_levels
            SET current_stock = current_stock + OLD.quantity
            WHERE product_id = OLD.product_id AND warehouse_id = OLD.warehouse_id;
        END IF;

        -- Asegurar fila de stock para el nuevo producto/almacén (si cambió)
        INSERT INTO stock_levels (product_id, warehouse_id, current_stock)
        VALUES (NEW.product_id, NEW.warehouse_id, 0)
        ON CONFLICT (product_id, warehouse_id) DO NOTHING;

        -- Aplicar el nuevo movimiento
        IF (NEW.type = 'IN') THEN
            UPDATE stock_levels
            SET current_stock = current_stock + NEW.quantity
            WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
        ELSIF (NEW.type = 'OUT') THEN
            UPDATE stock_levels
            SET current_stock = current_stock - NEW.quantity
            WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
        END IF;

    -- ── DELETE: revertir el movimiento eliminado ─────────────────────────────
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.type = 'IN') THEN
            UPDATE stock_levels
            SET current_stock = current_stock - OLD.quantity
            WHERE product_id = OLD.product_id AND warehouse_id = OLD.warehouse_id;
        ELSIF (OLD.type = 'OUT') THEN
            UPDATE stock_levels
            SET current_stock = current_stock + OLD.quantity
            WHERE product_id = OLD.product_id AND warehouse_id = OLD.warehouse_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_inventory_movement
AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION fn_update_stock_on_movement();

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 3: MÓDULO DE VENTAS
-- ─────────────────────────────────────────────────────────────────────────────

-- 7. Clientes
CREATE TYPE client_doc_type AS ENUM ('DNI', 'RUC', 'Otros');

CREATE TABLE clients (
    id          SERIAL PRIMARY KEY,
    type        client_doc_type NOT NULL,
    number      TEXT NOT NULL UNIQUE,          -- Nro. documento (único)
    name        TEXT NOT NULL,                 -- Razón social o nombre completo
    address     TEXT,
    email       TEXT,
    phone       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Cabecera de Ventas
CREATE TYPE sale_doc_type AS ENUM ('Factura', 'Boleta');
CREATE TYPE sale_status   AS ENUM ('Paid', 'Annulled');

CREATE TABLE sales_header (
    id           SERIAL PRIMARY KEY,
    client_id    INTEGER NOT NULL REFERENCES clients(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    doc_type     sale_doc_type NOT NULL,
    series       TEXT NOT NULL,               -- ej: F001, B001
    number       TEXT NOT NULL,               -- ej: 00001
    status       sale_status NOT NULL DEFAULT 'Paid',
    subtotal     DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_total    DECIMAL(12,2) NOT NULL DEFAULT 0,  -- IGV (18%)
    total        DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (doc_type, series, number)
);

-- 9. Detalle de Ventas
CREATE TABLE sales_items (
    id           SERIAL PRIMARY KEY,
    sale_id      INTEGER NOT NULL REFERENCES sales_header(id) ON DELETE CASCADE,
    product_id   INTEGER NOT NULL REFERENCES productos(id),
    quantity     DECIMAL(12,2) NOT NULL,
    unit_price   DECIMAL(12,2) NOT NULL,      -- Precio de venta unitario
    total_line   DECIMAL(12,2) NOT NULL       -- quantity * unit_price
);

-- 10. Trigger: al confirmar una venta → generar movimiento OUT SALE automáticamente
CREATE OR REPLACE FUNCTION fn_create_movement_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT en sales_items → generar movimiento OUT de tipo SALE
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO inventory_movements (product_id, warehouse_id, quantity, unit_cost, type, reason, document_ref)
        SELECT
            NEW.product_id,
            sh.warehouse_id,
            NEW.quantity,
            NEW.unit_price,
            'OUT'::movement_type,
            'SALE'::movement_reason,
            sh.doc_type || ' ' || sh.series || '-' || sh.number
        FROM sales_header sh WHERE sh.id = NEW.sale_id;

    -- DELETE en sales_items (anulación) → generar movimiento IN de tipo RETURN
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO inventory_movements (product_id, warehouse_id, quantity, unit_cost, type, reason, document_ref)
        SELECT
            OLD.product_id,
            sh.warehouse_id,
            OLD.quantity,
            OLD.unit_price,
            'IN'::movement_type,
            'SALE'::movement_reason,
            'NC: ' || sh.doc_type || ' ' || sh.series || '-' || sh.number
        FROM sales_header sh WHERE sh.id = OLD.sale_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_sale_item
AFTER INSERT OR DELETE ON sales_items
FOR EACH ROW
EXECUTE FUNCTION fn_create_movement_on_sale();

-- 11. Correlativos de documentos de venta
CREATE TABLE document_sequences (
    id             SERIAL PRIMARY KEY,
    doc_type       sale_doc_type NOT NULL,
    series         TEXT NOT NULL,          -- ej: F001, B001, B002
    current_number INTEGER NOT NULL DEFAULT 0,
    is_automatic   BOOLEAN NOT NULL DEFAULT TRUE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (doc_type, series)
);
