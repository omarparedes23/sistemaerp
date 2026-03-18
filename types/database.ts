// Tipos TypeScript generados a partir de DATABASE.sql
// Actualizar si se modifican las tablas en Supabase

export type MovementType = "IN" | "OUT";
export type MovementReason =
  | "PURCHASE"
  | "SALE"
  | "ADJUSTMENT"
  | "INVENTORY_COUNT"
  | "INITIAL_LOAD"
  | "TRANSFER";

// ─── Tablas maestras ──────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Brand {
  id: number;
  name: string;
  created_at: string;
}

export interface Unit {
  id: number;
  name: string;        // ej: Unidades, Litros, Kilos
  abbreviation: string; // ej: UND, LTS, KGS
}

// ─── Almacenes ────────────────────────────────────────────────────────────────

export interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  is_active: boolean;
}

// ─── Productos ────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  sku: string;        // caCodigo — identificador comercial único
  name: string;
  description: string | null;
  category_id: number | null;
  brand_id: number | null;
  unit_id: number | null;
  created_at: string;
  updated_at: string;
}

// Con relaciones JOIN (para listados enriquecidos)
export interface ProductWithRelations extends Product {
  category: Category | null;
  brand: Brand | null;
  unit: Unit | null;
}

// ─── Inventario ───────────────────────────────────────────────────────────────

export interface StockLevel {
  product_id: number;
  warehouse_id: number;
  current_stock: number;
}

// Con relaciones JOIN (para reporte de stocks)
export interface StockLevelWithRelations extends StockLevel {
  product: Product;
  warehouse: Warehouse;
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  type: MovementType;
  reason: MovementReason;
  document_ref: string | null; // Referencia a Factura, Guía o Ticket
  user_id: string | null;      // UUID del usuario en Supabase Auth
  created_at: string;
}

// Con relaciones JOIN (para Kardex / historial)
export interface InventoryMovementWithRelations extends InventoryMovement {
  product: Product;
  warehouse: Warehouse;
}

// ─── Tipos para Database (compatible con createClient<Database>()) ─────────────

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at">;
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      brands: {
        Row: Brand;
        Insert: Omit<Brand, "id" | "created_at">;
        Update: Partial<Omit<Brand, "id" | "created_at">>;
      };
      units: {
        Row: Unit;
        Insert: Omit<Unit, "id">;
        Update: Partial<Omit<Unit, "id">>;
      };
      warehouses: {
        Row: Warehouse;
        Insert: Omit<Warehouse, "id">;
        Update: Partial<Omit<Warehouse, "id">>;
      };
      productos: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
      };
      stock_levels: {
        Row: StockLevel;
        Insert: StockLevel;
        Update: Partial<StockLevel>;
      };
      inventory_movements: {
        Row: InventoryMovement;
        Insert: Omit<InventoryMovement, "id" | "created_at" | "user_id">;
        Update: never; // Los movimientos son inmutables
      };
    };
    Enums: {
      movement_type: MovementType;
      movement_reason: MovementReason;
    };
  };
};
