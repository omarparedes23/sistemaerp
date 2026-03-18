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
    abbreviation TEXT NOT NULL -- ej: UND, LTS, KGS
);

-- 2. Maestro de Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE, -- Tu 'caCodigo'
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

-- 4. Niveles de Stock (Saldos actuales)
CREATE TABLE stock_levels (
    product_id INTEGER REFERENCES productos(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    current_stock DECIMAL(12,2) DEFAULT 0,
    PRIMARY KEY (product_id, warehouse_id)
);

-- 5. Historial de Movimientos
CREATE TYPE movement_type AS ENUM ('IN', 'OUT');
CREATE TYPE movement_reason AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT', 'INVENTORY_COUNT', 'INITIAL_LOAD', 'TRANSFER');

CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES productos(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    quantity DECIMAL(12,2) NOT NULL,
    type movement_type NOT NULL,
    reason movement_reason NOT NULL,
    document_ref TEXT, -- Referencia a Factura, Guía o Ticket
    user_id UUID DEFAULT auth.uid(), -- ID del usuario en Supabase
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LA MAGIA: El Trigger para actualizar stock automáticamente
CREATE OR REPLACE FUNCTION fn_update_stock_on_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si ya existe el registro en stock_levels, si no, crearlo con 0
    INSERT INTO stock_levels (product_id, warehouse_id, current_stock)
    VALUES (NEW.product_id, NEW.warehouse_id, 0)
    ON CONFLICT (product_id, warehouse_id) DO NOTHING;

    -- Actualizar el stock dependiendo de si es entrada o salida
    IF (NEW.type = 'IN') THEN
        UPDATE stock_levels
        SET current_stock = current_stock + NEW.quantity
        WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
    ELSIF (NEW.type = 'OUT') THEN
        UPDATE stock_levels
        SET current_stock = current_stock - NEW.quantity
        WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_inventory_movement
AFTER INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION fn_update_stock_on_movement();