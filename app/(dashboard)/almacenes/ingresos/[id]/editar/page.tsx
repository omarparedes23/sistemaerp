import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getIngreso, updateIngreso } from "@/actions/movements";
import { getActiveWarehouses } from "@/actions/warehouses";
import { IngresoForm } from "@/components/modules/inventory/ingreso-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Editar Ingreso" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarIngresoPage({ params }: Props) {
  const { id } = await params;
  const movId = Number(id);

  if (isNaN(movId)) notFound();

  const [movement, warehouses] = await Promise.all([
    getIngreso(movId).catch(() => null),
    getActiveWarehouses(),
  ]);

  if (!movement) notFound();

  const product = movement.product;

  // Vincular la acción de actualización al ID del movimiento
  const boundAction = updateIngreso.bind(null, movId);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/almacenes/ingresos">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a Ingresos
          </Link>
        </Button>
      </div>

      {/* ── Encabezado ──────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Editar Ingreso</h2>
        <p className="text-muted-foreground">
          Corrige la cantidad, costo o referencia del documento{" "}
          {movement.document_ref && (
            <span className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">
              {movement.document_ref}
            </span>
          )}
        </p>
      </div>

      {/* ── Aviso informativo ───────────────────────────────── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <strong>Nota:</strong> Al guardar, el stock se recalculará automáticamente
        restando el valor anterior y sumando el nuevo.
      </div>

      <IngresoForm
        products={
          product
            ? [{ id: movement.product_id, sku: product.sku, name: product.name }]
            : []
        }
        warehouses={warehouses}
        mode="edit"
        initialData={{
          id: movement.id,
          document_ref: movement.document_ref ?? "",
          warehouse_id: movement.warehouse_id,
          reason: movement.reason,
          product_id: movement.product_id,
          product_sku: product?.sku ?? "",
          product_name: product?.name ?? "",
          quantity: Number(movement.quantity),
          unit_cost: Number(movement.unit_cost),
        }}
        serverAction={boundAction}
      />
    </div>
  );
}
