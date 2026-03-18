import type { Metadata } from "next";
import { getWarehouses, deleteWarehouse } from "@/actions/warehouses";
import { WarehouseDialog } from "@/components/modules/catalog/warehouse-dialog";
import { DeleteButton } from "@/components/modules/catalog/delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Almacenes" };

export default async function AlmacenesConfigPage() {
  const warehouses = await getWarehouses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Almacenes</h2>
          <p className="text-muted-foreground">
            Puntos físicos de almacenamiento: tiendas, depósitos, etc.
          </p>
        </div>
        <WarehouseDialog />
      </div>

      <div className="rounded-lg border bg-card">
        {warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No hay almacenes registrados. Crea el primero.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="w-28">Estado</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="text-muted-foreground">
                    {warehouse.id}
                  </TableCell>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {warehouse.location ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={warehouse.is_active ? "default" : "secondary"}>
                      {warehouse.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <WarehouseDialog warehouse={warehouse} />
                      <DeleteButton
                        label="almacén"
                        action={deleteWarehouse.bind(null, warehouse.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {warehouses.length} almacén{warehouses.length !== 1 ? "es" : ""} registrado{warehouses.length !== 1 ? "s" : ""}
        {" · "}
        {warehouses.filter((w) => w.is_active).length} activo{warehouses.filter((w) => w.is_active).length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
