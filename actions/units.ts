"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { unitSchema } from "@/schemas/units";
import type { ActionState } from "@/actions/brands";

export async function getUnits() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function createUnit(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = unitSchema.safeParse({
    name: formData.get("name"),
    abbreviation: formData.get("abbreviation"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("units").insert(parsed.data);

  if (error) {
    if (error.code === "23505") {
      return { error: { name: ["Ya existe una unidad con ese nombre"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/unidades");
  return { message: "Unidad creada correctamente" };
}

export async function updateUnit(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = unitSchema.safeParse({
    name: formData.get("name"),
    abbreviation: formData.get("abbreviation"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("units")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: { name: ["Ya existe una unidad con ese nombre"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/unidades");
  return { message: "Unidad actualizada correctamente" };
}

export async function deleteUnit(id: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("units").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: {
          name: ["No se puede eliminar: existen productos con esta unidad"],
        },
      };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/unidades");
  return { message: "Unidad eliminada correctamente" };
}
