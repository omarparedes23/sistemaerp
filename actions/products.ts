"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/schemas/products";
import type { ActionState } from "@/actions/brands";

// ─── Leer (con JOINs a marcas, categorías y unidades) ────────────────────────

export async function getProducts(search?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("productos")
    .select(`
      *,
      brand:brands(id, name),
      category:categories(id, name),
      unit:units(id, name, abbreviation)
    `)
    .order("name");

  if (search && search.trim() !== "") {
    // Buscar por SKU o por nombre (case-insensitive)
    query = query.or(`sku.ilike.%${search.trim()}%,name.ilike.%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// ─── Crear ────────────────────────────────────────────────────────────────────

export async function createProduct(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = productSchema.safeParse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    brand_id: formData.get("brand_id"),
    unit_id: formData.get("unit_id"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("productos").insert({
    ...parsed.data,
    description: parsed.data.description || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: { sku: ["Ya existe un producto con ese SKU"] } };
    }
    return { error: { sku: [error.message] } };
  }

  revalidatePath("/almacenes/productos");
  return { message: "Producto creado correctamente" };
}

// ─── Actualizar ───────────────────────────────────────────────────────────────

export async function updateProduct(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = productSchema.safeParse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    brand_id: formData.get("brand_id"),
    unit_id: formData.get("unit_id"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({
      ...parsed.data,
      description: parsed.data.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: { sku: ["Ya existe un producto con ese SKU"] } };
    }
    return { error: { sku: [error.message] } };
  }

  revalidatePath("/almacenes/productos");
  return { message: "Producto actualizado correctamente" };
}

// ─── Eliminar ─────────────────────────────────────────────────────────────────

export async function deleteProduct(id: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: {
          sku: ["No se puede eliminar: el producto tiene movimientos de inventario"],
        },
      };
    }
    return { error: { sku: [error.message] } };
  }

  revalidatePath("/almacenes/productos");
  return { message: "Producto eliminado correctamente" };
}
