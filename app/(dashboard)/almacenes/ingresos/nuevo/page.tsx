import type { Metadata } from "next";
import { getProducts } from "@/actions/products";
import { getActiveWarehouses } from "@/actions/warehouses";
import { IngresoForm } from "@/components/modules/inventory/ingreso-form";

export const metadata: Metadata = { title: "Nuevo Ingreso" };

export default async function NuevoIngresoPage() {
  const [products, warehouses] = await Promise.all([
    getProducts(),
    getActiveWarehouses(),
  ]);

  // Simplificar a solo lo que necesita el formulario
  const productOptions = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
  }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Ingreso de Mercadería</h2>
        <p className="text-muted-foreground">
          Registra una compra, importación o carga inicial de stock
        </p>
      </div>

      <IngresoForm products={productOptions} warehouses={warehouses} />
    </div>
  );
}
