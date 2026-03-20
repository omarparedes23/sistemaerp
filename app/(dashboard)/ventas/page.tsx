import type { Metadata } from "next";
import Link from "next/link";
import { getSales } from "@/actions/sales";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

export const metadata: Metadata = { title: "Ventas" };

function fmt(n: number) {
  return n.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function VentasPage() {
  const sales = await getSales();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ventas</h2>
          <p className="text-muted-foreground">
            Historial de Facturas y Boletas emitidas
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/ventas/nueva">
            <FilePlus2 className="mr-2 h-4 w-4" />
            Nueva Venta
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No hay ventas registradas. Emite la primera desde{" "}
              <Link href="/ventas/nueva" className="underline">
                Nueva Venta
              </Link>
              .
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Comprobante</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell w-36">Almacén</TableHead>
                <TableHead className="hidden sm:table-cell w-28 text-right">Subtotal</TableHead>
                <TableHead className="hidden sm:table-cell w-24 text-right">IGV</TableHead>
                <TableHead className="w-28 text-right">Total</TableHead>
                <TableHead className="w-24">Estado</TableHead>
                <TableHead className="hidden sm:table-cell w-36">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const client = sale.client as
                  | { id: number; name: string; number: string }
                  | null;
                const warehouse = sale.warehouse as
                  | { id: number; name: string }
                  | null;

                return (
                  <TableRow key={sale.id}>
                    {/* Número de comprobante */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            sale.doc_type === "Factura" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {sale.doc_type === "Factura" ? "FAC" : "BOL"}
                        </Badge>
                        <span className="font-mono text-sm font-medium">
                          {sale.series}-{sale.number}
                        </span>
                      </div>
                    </TableCell>

                    {/* Cliente */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {client?.name ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {client?.number ?? ""}
                        </span>
                      </div>
                    </TableCell>

                    {/* Almacén */}
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {warehouse?.name ?? "—"}
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell className="hidden sm:table-cell text-right text-sm tabular-nums">
                      S/ {fmt(sale.subtotal)}
                    </TableCell>

                    {/* IGV */}
                    <TableCell className="hidden sm:table-cell text-right text-sm tabular-nums text-muted-foreground">
                      S/ {fmt(sale.tax_total)}
                    </TableCell>

                    {/* Total */}
                    <TableCell className="text-right font-semibold tabular-nums">
                      S/ {fmt(sale.total)}
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge
                        variant={
                          sale.status === "Paid" ? "default" : "destructive"
                        }
                      >
                        {sale.status === "Paid" ? "Pagado" : "Anulado"}
                      </Badge>
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(sale.created_at).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {sales.length} comprobante{sales.length !== 1 ? "s" : ""} registrado
        {sales.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
