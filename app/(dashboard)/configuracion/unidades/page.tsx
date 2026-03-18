import type { Metadata } from "next";
import { getUnits, deleteUnit } from "@/actions/units";
import { UnitDialog } from "@/components/modules/catalog/unit-dialog";
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

export const metadata: Metadata = { title: "Unidades de Medida" };

export default async function UnidadesPage() {
  const units = await getUnits();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unidades de Medida</h2>
          <p className="text-muted-foreground">
            Unidades utilizadas en el inventario (UND, LTS, KGS, etc.)
          </p>
        </div>
        <UnitDialog />
      </div>

      <div className="rounded-lg border bg-card">
        {units.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No hay unidades registradas. Crea la primera.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-32">Abreviatura</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="text-muted-foreground">
                    {unit.id}
                  </TableCell>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {unit.abbreviation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <UnitDialog unit={unit} />
                      <DeleteButton
                        label="unidad"
                        action={deleteUnit.bind(null, unit.id)}
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
        {units.length} unidad{units.length !== 1 ? "es" : ""} registrada{units.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
