"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/schemas/categories";
import type { ActionState } from "@/actions/brands";

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = categorySchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    if (error.code === "23505") {
      return { error: { name: ["Ya existe una categoría con ese nombre"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/categorias");
  return { message: "Categoría creada correctamente" };
}

export async function updateCategory(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = categorySchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: { name: ["Ya existe una categoría con ese nombre"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/categorias");
  return { message: "Categoría actualizada correctamente" };
}

export async function deleteCategory(id: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: {
          name: ["No se puede eliminar: existen productos con esta categoría"],
        },
      };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/configuracion/categorias");
  return { message: "Categoría eliminada correctamente" };
}
