-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN FASE 3: Módulo de Ventas y Clientes
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. ENUMs nuevos
CREATE TYPE client_doc_type AS ENUM ('DNI', 'RUC', 'Otros');
CREATE TYPE sale_doc_type   AS ENUM ('Factura', 'Boleta');
CREATE TYPE sale_status     AS ENUM ('Paid', 'Annulled');

-- 2. Tabla de Clientes
CREATE TABLE clients (
    id          SERIAL PRIMARY KEY,
    type        client_doc_type NOT NULL,
    number      TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    address     TEXT,
    email       TEXT,
    phone       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cabecera de Ventas
CREATE TABLE sales_header (
    id           SERIAL PRIMARY KEY,
    client_id    INTEGER NOT NULL REFERENCES clients(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    doc_type     sale_doc_type NOT NULL,
    series       TEXT NOT NULL,
    number       TEXT NOT NULL,
    status       sale_status NOT NULL DEFAULT 'Paid',
    subtotal     DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_total    DECIMAL(12,2) NOT NULL DEFAULT 0,
    total        DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (doc_type, series, number)
);

-- 4. Detalle de Ventas
CREATE TABLE sales_items (
    id           SERIAL PRIMARY KEY,
    sale_id      INTEGER NOT NULL REFERENCES sales_header(id) ON DELETE CASCADE,
    product_id   INTEGER NOT NULL REFERENCES productos(id),
    quantity     DECIMAL(12,2) NOT NULL,
    unit_price   DECIMAL(12,2) NOT NULL,
    total_line   DECIMAL(12,2) NOT NULL
);

-- 5. Trigger: INSERT en sales_items → OUT SALE | DELETE (anulación) → IN RETURN
CREATE OR REPLACE FUNCTION fn_create_movement_on_sale()
RETURNS TRIGGER AS $$
BEGIN
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

-- 6. Tabla de Correlativos
CREATE TABLE document_sequences (
    id             SERIAL PRIMARY KEY,
    doc_type       sale_doc_type NOT NULL,
    series         TEXT NOT NULL,
    current_number INTEGER NOT NULL DEFAULT 0,
    is_automatic   BOOLEAN NOT NULL DEFAULT TRUE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (doc_type, series)
);

-- Datos iniciales de ejemplo
INSERT INTO document_sequences (doc_type, series, current_number, is_automatic) VALUES
    ('Factura', 'F001', 0, TRUE),
    ('Boleta',  'B001', 0, TRUE);
