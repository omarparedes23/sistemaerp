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
  // Los items llegan serializados como JSON desde el formulario cliente
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

  // Construir todos los movimientos para un insert bulk
  const movements = items.map((item) => ({
    product_id: item.product_id,
    warehouse_id,
    quantity: item.quantity,
    type: "IN" as const,
    reason,
    document_ref,
  }));

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_movements").insert(movements);

  if (error) {
    return { error: { document_ref: [error.message] } };
  }

  // El trigger fn_update_stock_on_movement actualiza stock_levels automáticamente
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
