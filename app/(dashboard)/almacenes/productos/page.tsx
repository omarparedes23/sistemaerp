import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts, deleteProduct } from "@/actions/products";
import { getBrands } from "@/actions/brands";
import { getCategories } from "@/actions/categories";
import { getUnits } from "@/actions/units";
import { ProductDialog } from "@/components/modules/inventory/product-dialog";
import { ProductSearch } from "@/components/modules/inventory/product-search";
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
import { Package } from "lucide-react";

export const metadata: Metadata = { title: "Productos" };

interface ProductosPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const { q } = await searchParams;

  // Carga en paralelo: productos filtrados + catálogos para los selects del form
  const [products, brands, categories, units] = await Promise.all([
    getProducts(q),
    getBrands(),
    getCategories(),
    getUnits(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
          <p className="text-muted-foreground">
            Catálogo maestro de artículos con SKU
          </p>
        </div>
        <ProductDialog brands={brands} categories={categories} units={units} />
      </div>

      {/* Barra de búsqueda */}
      <Suspense>
        <ProductSearch defaultValue={q ?? ""} />
      </Suspense>

      <div className="rounded-lg border bg-card">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            {q ? (
              <>
                <h3 className="text-base font-semibold text-muted-foreground">
                  Sin resultados para &quot;{q}&quot;
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Intenta con otro SKU o nombre
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-muted-foreground">
                  No hay productos registrados
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Crea el primer producto con el botón de arriba
                </p>
              </>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="w-24">Unidad</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {product.sku}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.brand ? (
                      <Badge variant="outline">{product.brand.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <span className="text-sm">{product.category.name}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.unit ? (
                      <Badge variant="secondary" className="font-mono">
                        {product.unit.abbreviation}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ProductDialog
                        product={product}
                        brands={brands}
                        categories={categories}
                        units={units}
                      />
                      <DeleteButton
                        label="producto"
                        action={deleteProduct.bind(null, product.id)}
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
        {q
          ? `${products.length} resultado${products.length !== 1 ? "s" : ""} para "${q}"`
          : `${products.length} producto${products.length !== 1 ? "s" : ""} registrado${products.length !== 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
