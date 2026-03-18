"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ingresoSchema } from "@/schemas/movements";
import type { ActionState } from "@/actions/brands";

// ─── Crear Ingreso (inserta N movimientos tipo IN) ────────────────────────────

export async function createIngreso(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: { document_ref: ["Error al procesar los productos"] } };
  }

  const parsed = ingresoSchema.safeParse({
    document_ref: formData.get("document_ref"),
    warehouse_id: Number(formData.get("warehouse_id")),
    reason: formData.get("reason"),
    items: itemsRaw,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { document_ref, warehouse_id, reason, items } = parsed.data;

  const movements = items.map((item) => ({
    product_id: item.product_id,
    warehouse_id,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    type: "IN" as const,
    reason,
    document_ref,
  }));

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_movements").insert(movements);

  if (error) {
    return { error: { document_ref: [error.message] } };
  }

  revalidatePath("/almacenes/ingresos");
  revalidatePath("/almacenes/stocks");
  return { message: "Ingreso procesado correctamente" };
}

// ─── Leer historial de ingresos (movimientos tipo IN) ─────────────────────────

export async function getIngresos(limit = 100) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_movements")
    .select(`
      id,
      document_ref,
      quantity,
      unit_cost,
      reason,
      created_at,
      product:productos(id, sku, name),
      warehouse:warehouses(id, name)
    `)
    .eq("type", "IN")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Leer un movimiento por ID (para edición) ─────────────────────────────────

export async function getIngreso(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_movements")
    .select(`
      id,
      document_ref,
      quantity,
      unit_cost,
      reason,
      warehouse_id,
      product_id,
      product:productos(id, sku, name),
      warehouse:warehouses(id, name)
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Actualizar un movimiento existente ───────────────────────────────────────

export async function updateIngreso(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: { document_ref: ["Error al procesar los productos"] } };
  }

  const parsed = ingresoSchema.safeParse({
    document_ref: formData.get("document_ref"),
    warehouse_id: Number(formData.get("warehouse_id")),
    reason: formData.get("reason"),
    items: itemsRaw,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { document_ref, warehouse_id, reason, items } = parsed.data;
  const item = items[0];

  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_movements")
    .update({
      document_ref,
      warehouse_id,
      reason,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
    })
    .eq("id", id);

  if (error) {
    return { error: { document_ref: [error.message] } };
  }

  revalidatePath("/almacenes/ingresos");
  revalidatePath("/almacenes/stocks");
  return { message: "Ingreso actualizado correctamente" };
}
