import type { Metadata } from "next";
import { Suspense } from "react";
import { getStockLevels } from "@/actions/stock";
import { getActiveWarehouses } from "@/actions/warehouses";
import { StockFilter } from "@/components/modules/inventory/stock-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Existencias" };

interface StocksPageProps {
  searchParams: Promise<{ warehouse?: string }>;
}

export default async function StocksPage({ searchParams }: StocksPageProps) {
  const { warehouse } = await searchParams;
  const warehouseId = warehouse ? Number(warehouse) : undefined;

  const [stockLevels, warehouses] = await Promise.all([
    getStockLevels(warehouseId),
    getActiveWarehouses(),
  ]);

  const totalProductos = stockLevels.length;
  const sinStock = stockLevels.filter((s) => s.current_stock <= 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Existencias</h2>
          <p className="text-muted-foreground">
            Stock actual por producto y almacén
          </p>
        </div>
        {/* Resumen rápido */}
        <div className="flex gap-3 text-sm">
          <div className="rounded-lg border bg-card px-4 py-2 text-center">
            <p className="text-2xl font-bold">{totalProductos}</p>
            <p className="text-xs text-muted-foreground">Registros</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-2 text-center">
            <p className="text-2xl font-bold text-destructive">{sinStock}</p>
            <p className="text-xs text-muted-foreground">Sin stock</p>
          </div>
        </div>
      </div>

      {/* Filtro por almacén */}
      <Suspense>
        <StockFilter warehouses={warehouses} currentWarehouseId={warehouseId} />
      </Suspense>

      <div className="rounded-lg border bg-card">
        {stockLevels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold text-muted-foreground">
              Sin movimientos registrados
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              El stock se actualiza automáticamente al registrar ingresos
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead className="w-28 text-right">Stock Actual</TableHead>
                <TableHead className="w-24">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockLevels.map((stock, idx) => {
                const stockNum = Number(stock.current_stock);
                const sinStock = stockNum <= 0;
                const stockBajo = stockNum > 0 && stockNum <= 5;

                return (
                  <TableRow key={idx} className={cn(sinStock && "bg-destructive/5 hover:bg-destructive/10")}>
                    <TableCell>
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {stock.product?.sku ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {stock.product?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {stock.warehouse?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "text-lg font-bold",
                          sinStock && "text-destructive",
                          stockBajo && "text-yellow-600",
                          !sinStock && !stockBajo && "text-green-600"
                        )}
                      >
                        {stockNum % 1 === 0 ? stockNum : stockNum.toFixed(2)}
                      </span>
                      {stock.product?.unit && (
                        <span className="text-xs text-muted-foreground ml-1">
                          {stock.product.unit.abbreviation}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sinStock ? "destructive" : stockBajo ? "outline" : "secondary"
                        }
                        className={cn(
                          !sinStock && !stockBajo && "border-green-200 bg-green-50 text-green-700"
                        )}
                      >
                        {sinStock ? "Sin stock" : stockBajo ? "Stock bajo" : "OK"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
