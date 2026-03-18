"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { clientSchema } from "@/schemas/clients";
import type { ActionState } from "@/actions/brands";

function toNullable(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

export async function getClients() {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function createClient(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    type: formData.get("type"),
    number: formData.get("number"),
    name: formData.get("name"),
    address: formData.get("address") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
  };

  const parsed = clientSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").insert({
    type: parsed.data.type,
    number: parsed.data.number,
    name: parsed.data.name,
    address: toNullable(parsed.data.address),
    email: toNullable(parsed.data.email),
    phone: toNullable(parsed.data.phone),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: { number: ["Ya existe un cliente con ese número de documento"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/ventas/clientes");
  return { message: "Cliente creado correctamente" };
}

export async function updateClient(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    type: formData.get("type"),
    number: formData.get("number"),
    name: formData.get("name"),
    address: formData.get("address") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
  };

  const parsed = clientSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("clients")
    .update({
      type: parsed.data.type,
      number: parsed.data.number,
      name: parsed.data.name,
      address: toNullable(parsed.data.address),
      email: toNullable(parsed.data.email),
      phone: toNullable(parsed.data.phone),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: { number: ["Ya existe un cliente con ese número de documento"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/ventas/clientes");
  return { message: "Cliente actualizado correctamente" };
}

export async function deleteClient(id: number): Promise<ActionState> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: { name: ["No se puede eliminar: el cliente tiene ventas registradas"] },
      };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/ventas/clientes");
  return { message: "Cliente eliminado correctamente" };
}
