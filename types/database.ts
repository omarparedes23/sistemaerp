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
  category: Pick<Category, "id" | "name"> | null;
  brand: Pick<Brand, "id" | "name"> | null;
  unit: Pick<Unit, "id" | "name" | "abbreviation"> | null;
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
  unit_cost: number;           // Costo unitario al momento del movimiento
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

// ─── Tipos para Database (formato compatible con Supabase CLI) ────────────────

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      units: {
        Row: {
          id: number;
          name: string;
          abbreviation: string;
        };
        Insert: {
          id?: number;
          name: string;
          abbreviation: string;
        };
        Update: {
          id?: number;
          name?: string;
          abbreviation?: string;
        };
        Relationships: [];
      };
      warehouses: {
        Row: {
          id: number;
          name: string;
          location: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: number;
          name: string;
          location?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: number;
          name?: string;
          location?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      productos: {
        Row: {
          id: number;
          sku: string;
          name: string;
          description: string | null;
          category_id: number | null;
          brand_id: number | null;
          unit_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          sku: string;
          name: string;
          description?: string | null;
          category_id?: number | null;
          brand_id?: number | null;
          unit_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          sku?: string;
          name?: string;
          description?: string | null;
          category_id?: number | null;
          brand_id?: number | null;
          unit_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "productos_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "productos_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "productos_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      stock_levels: {
        Row: {
          product_id: number;
          warehouse_id: number;
          current_stock: number;
        };
        Insert: {
          product_id: number;
          warehouse_id: number;
          current_stock?: number;
        };
        Update: {
          product_id?: number;
          warehouse_id?: number;
          current_stock?: number;
        };
        Relationships: [
          {
            foreignKeyName: "stock_levels_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "productos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_levels_warehouse_id_fkey";
            columns: ["warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_movements: {
        Row: {
          id: number;
          product_id: number;
          warehouse_id: number;
          quantity: number;
          unit_cost: number;
          type: MovementType;
          reason: MovementReason;
          document_ref: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          product_id: number;
          warehouse_id: number;
          quantity: number;
          unit_cost?: number;
          type: MovementType;
          reason: MovementReason;
          document_ref?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          product_id?: number;
          warehouse_id?: number;
          quantity?: number;
          unit_cost?: number;
          type?: MovementType;
          reason?: MovementReason;
          document_ref?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "productos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_movements_warehouse_id_fkey";
            columns: ["warehouse_id"];
            isOneToOne: false;
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      movement_type: MovementType;
      movement_reason: MovementReason;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
