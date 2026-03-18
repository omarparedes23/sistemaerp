"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saleSchema } from "@/schemas/sales";
import { bumpSequenceNumber } from "@/actions/sequences";
import type { ActionState } from "@/actions/brands";

export async function createSale(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ── 1. Parsear y validar ───────────────────────────────────────────────────
  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse(formData.get("items") as string);
  } catch {
    return { error: { items: ["Error al procesar los productos"] } };
  }

  const parsed = saleSchema.safeParse({
    client_id: Number(formData.get("client_id")),
    warehouse_id: Number(formData.get("warehouse_id")),
    doc_type: formData.get("doc_type"),
    series: formData.get("series"),
    number: formData.get("number"),
    subtotal: Number(formData.get("subtotal")),
    tax_total: Number(formData.get("tax_total")),
    total: Number(formData.get("total")),
    items: itemsRaw,
    sequence_id: formData.get("sequence_id")
      ? Number(formData.get("sequence_id"))
      : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { items, sequence_id, ...header } = parsed.data;

  const supabase = await createClient();

  // ── 2. Validar stock suficiente ────────────────────────────────────────────
  const productIds = items.map((i) => i.product_id);

  const { data: stockRows, error: stockError } = await supabase
    .from("stock_levels")
    .select("product_id, current_stock, product:productos(name)")
    .eq("warehouse_id", header.warehouse_id)
    .in("product_id", productIds);

  if (stockError) {
    return { error: { items: ["Error al verificar el stock: " + stockError.message] } };
  }

  // Construir mapa product_id → { stock, name }
  const stockMap = new Map<number, { stock: number; name: string }>(
    (stockRows ?? []).map((r) => [
      r.product_id,
      {
        stock: r.current_stock,
        name: (r.product as { name: string } | null)?.name ?? `Producto #${r.product_id}`,
      },
    ])
  );

  const stockErrors: string[] = [];
  for (const item of items) {
    const entry = stockMap.get(item.product_id);
    const available = entry?.stock ?? 0;
    if (item.quantity > available) {
      const name = entry?.name ?? `Producto #${item.product_id}`;
      stockErrors.push(
        `"${name}": necesitas ${item.quantity}, disponible ${available}`
      );
    }
  }

  if (stockErrors.length > 0) {
    return {
      error: {
        items: ["Stock insuficiente — " + stockErrors.join(" | ")],
      },
    };
  }

  // ── 3. Insertar cabecera ───────────────────────────────────────────────────
  const { data: saleRow, error: headerError } = await supabase
    .from("sales_header")
    .insert(header)
    .select("id")
    .single();

  if (headerError) {
    if (headerError.code === "23505") {
      return {
        error: {
          number: [
            `Ya existe un comprobante ${header.doc_type} ${header.series}-${header.number}`,
          ],
        },
      };
    }
    return { error: { number: [headerError.message] } };
  }

  // ── 4. Insertar ítems (trigger genera movimientos OUT automáticamente) ─────
  const saleItems = items.map((item) => ({
    sale_id: saleRow.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_line: item.total_line,
  }));

  const { error: itemsError } = await supabase
    .from("sales_items")
    .insert(saleItems);

  if (itemsError) {
    // Revertir cabecera (CASCADE elimina ítems si los hubiera)
    await supabase.from("sales_header").delete().eq("id", saleRow.id);
    return { error: { items: [itemsError.message] } };
  }

  // ── 5. Incrementar correlativo si es automático ────────────────────────────
  if (sequence_id) {
    await bumpSequenceNumber(sequence_id);
  }

  revalidatePath("/ventas");
  revalidatePath("/almacenes/stocks");
  revalidatePath("/ventas/correlativos");

  redirect("/ventas");
}

// ─── Leer ventas (listado) ────────────────────────────────────────────────────

export async function getSales(limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales_header")
    .select(`
      id,
      doc_type,
      series,
      number,
      status,
      subtotal,
      tax_total,
      total,
      created_at,
      client:clients(id, name, number),
      warehouse:warehouses(id, name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}
