"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStockLevels(warehouseId?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("stock_levels")
    .select(`
      current_stock,
      product:productos(id, sku, name, unit:units(abbreviation)),
      warehouse:warehouses(id, name)
    `);

  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // Ordenar por nombre de almacén y luego por nombre de producto
  return (data ?? []).sort((a, b) => {
    const warehouseCompare = (a.warehouse?.name ?? "").localeCompare(b.warehouse?.name ?? "");
    if (warehouseCompare !== 0) return warehouseCompare;
    return (a.product?.name ?? "").localeCompare(b.product?.name ?? "");
  });
}
