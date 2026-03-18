import type { Metadata } from "next";
import { getClients } from "@/actions/clients";
import { getProducts } from "@/actions/products";
import { getActiveWarehouses } from "@/actions/warehouses";
import { getSequences } from "@/actions/sequences";
import { getStockLevels } from "@/actions/stock";
import { SaleForm } from "@/components/modules/ventas/sale-form";

export const metadata: Metadata = { title: "Nueva Venta" };

export default async function NuevaVentaPage() {
  const [clients, products, warehouses, allSequences, stockData] =
    await Promise.all([
      getClients(),
      getProducts(),
      getActiveWarehouses(),
      getSequences(),
      getStockLevels(),
    ]);

  // ── Series activas agrupadas por tipo ──────────────────────────────────────
  const activeSeqs = allSequences.filter((s) => s.is_active);
  const sequences = {
    Factura: activeSeqs
      .filter((s) => s.doc_type === "Factura")
      .map(({ id, series, current_number, is_automatic }) => ({
        id,
        series,
        current_number,
        is_automatic,
      })),
    Boleta: activeSeqs
      .filter((s) => s.doc_type === "Boleta")
      .map(({ id, series, current_number, is_automatic }) => ({
        id,
        series,
        current_number,
        is_automatic,
      })),
  };

  // ── Mapa de stock: warehouseId → productId → current_stock ────────────────
  const stockMap: Record<number, Record<number, number>> = {};
  for (const entry of stockData) {
    const wid = (entry.warehouse as { id: number } | null)?.id;
    const pid = (entry.product as { id: number } | null)?.id;
    if (wid && pid) {
      if (!stockMap[wid]) stockMap[wid] = {};
      stockMap[wid][pid] = entry.current_stock;
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Venta</h2>
        <p className="text-muted-foreground">
          Emite una Factura o Boleta. El stock se descuenta automáticamente al
          guardar.
        </p>
      </div>

      <SaleForm
        clients={clients.map(({ id, type, number, name }) => ({
          id,
          type,
          number,
          name,
        }))}
        products={products.map(({ id, sku, name }) => ({ id, sku, name }))}
        warehouses={warehouses.map(({ id, name }) => ({ id, name }))}
        sequences={sequences}
        stockMap={stockMap}
      />
    </div>
  );
}
