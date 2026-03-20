import type { Metadata } from "next";
import Link from "next/link";
import { getIngresos } from "@/actions/movements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownToLine, PackagePlus, Pencil } from "lucide-react";

export const metadata: Metadata = { title: "Ingresos" };

const REASON_LABELS: Record<string, string> = {
  PURCHASE: "Compra",
  INITIAL_LOAD: "Carga Inicial",
  TRANSFER: "Transferencia",
  INVENTORY_COUNT: "Ajuste de Inventario",
};

export default async function IngresosPage() {
  const ingresos = await getIngresos(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ingresos de Mercadería</h2>
          <p className="text-muted-foreground">
            Historial de entradas de stock al inventario
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/almacenes/ingresos/nuevo">
            <PackagePlus className="mr-2 h-4 w-4" />
            Nuevo Ingreso
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        {ingresos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowDownToLine className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold text-muted-foreground">
              Sin ingresos registrados
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Registra el primer ingreso con el botón de arriba
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden sm:table-cell">Almacén</TableHead>
                <TableHead className="hidden sm:table-cell w-28">Motivo</TableHead>
                <TableHead className="w-24 text-right">Cantidad</TableHead>
                <TableHead className="hidden sm:table-cell w-28 text-right">Costo Unit.</TableHead>
                <TableHead className="hidden sm:table-cell w-28 text-right">Total</TableHead>
                <TableHead className="hidden md:table-cell w-40">Fecha</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingresos.map((mov) => {
                const qty = Number(mov.quantity);
                const cost = Number(mov.unit_cost);
                const total = qty * cost;
                return (
                  <TableRow key={mov.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {mov.document_ref ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{mov.product?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {mov.product?.sku}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {mov.warehouse?.name ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {REASON_LABELS[mov.reason] ?? mov.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-green-600">
                        +{qty % 1 === 0 ? qty : qty.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-sm text-muted-foreground">
                      {cost > 0
                        ? `S/ ${cost.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-sm font-medium">
                      {total > 0
                        ? `S/ ${total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {new Date(mov.created_at).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Link href={`/almacenes/ingresos/${mov.id}/editar`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {ingresos.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Mostrando los últimos {ingresos.length} movimientos de entrada
        </p>
      )}
    </div>
  );
}
