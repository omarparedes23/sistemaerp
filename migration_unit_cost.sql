-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Gestión de Costos y Edición de Ingresos
-- Fecha: 2026-03-18
-- Descripción: Agrega unit_cost a inventory_movements y actualiza el trigger
--              para manejar INSERT, UPDATE y DELETE con recálculo de stock.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Agregar columna unit_cost ─────────────────────────────────────────────
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0;

-- ─── 2. Eliminar trigger y función anteriores ──────────────────────────────────
DROP TRIGGER IF EXISTS trg_after_inventory_movement ON inventory_movements;
DROP FUNCTION IF EXISTS fn_update_stock_on_movement();

-- ─── 3. Nueva función: maneja INSERT, UPDATE y DELETE ─────────────────────────
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

-- ─── 4. Recrear trigger para INSERT, UPDATE y DELETE ──────────────────────────
CREATE TRIGGER trg_after_inventory_movement
AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION fn_update_stock_on_movement();
