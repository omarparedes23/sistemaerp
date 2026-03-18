"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionState } from "@/actions/brands";
import type { SaleDocType } from "@/types/database";

const sequenceSchema = z.object({
  doc_type: z.enum(["Factura", "Boleta"], {
    errorMap: () => ({ message: "Selecciona el tipo de comprobante" }),
  }),
  series: z
    .string()
    .min(1, "La serie es requerida")
    .max(10, "Máximo 10 caracteres")
    .trim()
    .toUpperCase(),
  current_number: z
    .number({ invalid_type_error: "Ingresa un número válido" })
    .int()
    .min(0, "El número inicial no puede ser negativo"),
  is_automatic: z.boolean(),
  is_active: z.boolean(),
});

// ─── Leer todas las series ────────────────────────────────────────────────────

export async function getSequences() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_sequences")
    .select("*")
    .order("doc_type")
    .order("series");

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Leer las series activas para un tipo de doc (para el formulario de venta) ─

export async function getActiveSequences(docType: SaleDocType) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_sequences")
    .select("id, series, current_number, is_automatic")
    .eq("doc_type", docType)
    .eq("is_active", true)
    .order("series");

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Crear ────────────────────────────────────────────────────────────────────

export async function createSequence(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = sequenceSchema.safeParse({
    doc_type: formData.get("doc_type"),
    series: formData.get("series"),
    current_number: Number(formData.get("current_number") ?? 0),
    is_automatic: formData.get("is_automatic") === "true",
    is_active: formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("document_sequences").insert(parsed.data);

  if (error) {
    if (error.code === "23505") {
      return { error: { series: ["Ya existe esa serie para el tipo de documento seleccionado"] } };
    }
    return { error: { series: [error.message] } };
  }

  revalidatePath("/ventas/correlativos");
  return { message: "Serie creada correctamente" };
}

// ─── Actualizar ───────────────────────────────────────────────────────────────

export async function updateSequence(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = sequenceSchema.safeParse({
    doc_type: formData.get("doc_type"),
    series: formData.get("series"),
    current_number: Number(formData.get("current_number") ?? 0),
    is_automatic: formData.get("is_automatic") === "true",
    is_active: formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("document_sequences")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: { series: ["Ya existe esa serie para el tipo de documento seleccionado"] } };
    }
    return { error: { series: [error.message] } };
  }

  revalidatePath("/ventas/correlativos");
  return { message: "Serie actualizada correctamente" };
}

// ─── Incrementar correlativo al emitir una venta (uso interno) ────────────────

export async function bumpSequenceNumber(sequenceId: number): Promise<void> {
  const supabase = await createClient();
  const { data: seq, error: fetchError } = await supabase
    .from("document_sequences")
    .select("current_number")
    .eq("id", sequenceId)
    .single();

  if (fetchError || !seq) return;

  await supabase
    .from("document_sequences")
    .update({ current_number: seq.current_number + 1 })
    .eq("id", sequenceId);
}
