"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { warehouseSchema } from "@/schemas/warehouses";
import type { ActionState } from "@/actions/brands";

export async function getWarehouses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getActiveWarehouses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warehouses")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function createWarehouse(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = warehouseSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    is_active: formData.get("is_active"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("warehouses").insert({
    ...parsed.data,
    location: parsed.data.location || null,
  });

  if (error) {
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/almacenes");
  return { message: "Almacén creado correctamente" };
}

export async function updateWarehouse(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = warehouseSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    is_active: formData.get("is_active"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("warehouses")
    .update({
      ...parsed.data,
      location: parsed.data.location || null,
    })
    .eq("id", id);

  if (error) {
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/almacenes");
  return { message: "Almacén actualizado correctamente" };
}

export async function deleteWarehouse(id: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("warehouses").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: {
          name: ["No se puede eliminar: el almacén tiene movimientos registrados"],
        },
      };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/almacenes");
  return { message: "Almacén eliminado correctamente" };
}
