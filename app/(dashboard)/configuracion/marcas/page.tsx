import type { Metadata } from "next";
import { getBrands, deleteBrand } from "@/actions/brands";
import { BrandDialog } from "@/components/modules/catalog/brand-dialog";
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

export const metadata: Metadata = { title: "Marcas" };

export default async function MarcasPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marcas</h2>
          <p className="text-muted-foreground">
            Gestión de marcas de productos
          </p>
        </div>
        <BrandDialog />
      </div>

      <div className="rounded-lg border bg-card">
        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No hay marcas registradas. Crea la primera.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="text-muted-foreground">
                    {brand.id}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {new Date(brand.created_at).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <BrandDialog brand={brand} />
                      <DeleteButton
                        label="marca"
                        action={deleteBrand.bind(null, brand.id)}
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
        {brands.length} marca{brands.length !== 1 ? "s" : ""} registrada{brands.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
