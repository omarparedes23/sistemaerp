import type { Metadata } from "next";
import { getCategories, deleteCategory } from "@/actions/categories";
import { CategoryDialog } from "@/components/modules/catalog/category-dialog";
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

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriasPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
          <p className="text-muted-foreground">
            Clasificación de productos por categoría
          </p>
        </div>
        <CategoryDialog />
      </div>

      <div className="rounded-lg border bg-card">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No hay categorías registradas. Crea la primera.
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
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-muted-foreground">
                    {category.id}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {new Date(category.created_at).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <CategoryDialog category={category} />
                      <DeleteButton
                        label="categoría"
                        action={deleteCategory.bind(null, category.id)}
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
        {categories.length} categoría{categories.length !== 1 ? "s" : ""} registrada{categories.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
