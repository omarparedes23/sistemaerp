"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { brandSchema } from "@/schemas/brands";

// ─── Tipo de retorno estándar para useActionState ─────────────────────────────

export type ActionState = {
  error?: Record<string, string[]>;
  message?: string;
} | null;

// ─── Leer ─────────────────────────────────────────────────────────────────────

export async function getBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

// ─── Crear ────────────────────────────────────────────────────────────────────

export async function createBrand(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = brandSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("brands").insert(parsed.data);

  if (error) {
    // El constraint UNIQUE en `name` retorna código 23505
    if (error.code === "23505") {
      return { error: { name: ["Ya existe una marca con ese nombre"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/marcas");
  return { message: "Marca creada correctamente" };
}

// ─── Actualizar ───────────────────────────────────────────────────────────────

export async function updateBrand(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = brandSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: { name: ["Ya existe una marca con ese nombre"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/marcas");
  return { message: "Marca actualizada correctamente" };
}

// ─── Eliminar ─────────────────────────────────────────────────────────────────

export async function deleteBrand(id: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("brands").delete().eq("id", id);

  if (error) {
    // FK violation: la marca está siendo usada por productos
    if (error.code === "23503") {
      return {
        error: {
          name: ["No se puede eliminar: existen productos con esta marca"],
        },
      };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/marcas");
  return { message: "Marca eliminada correctamente" };
}
