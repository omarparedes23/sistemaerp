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
import { ArrowDownToLine, PackagePlus } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ingresos de Mercadería</h2>
          <p className="text-muted-foreground">
            Historial de entradas de stock al inventario
          </p>
        </div>
        <Button asChild>
          <Link href="/almacenes/ingresos/nuevo">
            <PackagePlus className="mr-2 h-4 w-4" />
            Nuevo Ingreso
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
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
                <TableHead>Almacén</TableHead>
                <TableHead className="w-28">Motivo</TableHead>
                <TableHead className="w-28 text-right">Cantidad</TableHead>
                <TableHead className="w-40">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingresos.map((mov) => (
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
                  <TableCell className="text-muted-foreground text-sm">
                    {mov.warehouse?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {REASON_LABELS[mov.reason] ?? mov.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-green-600">
                      +{Number(mov.quantity) % 1 === 0
                        ? Number(mov.quantity)
                        : Number(mov.quantity).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(mov.created_at).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))}
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
