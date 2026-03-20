"use client";

import { useEffect, useActionState, useState } from "react";
import { Pencil, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProduct, updateProduct } from "@/actions/products";
import type { Brand, Category, Unit, ProductWithRelations } from "@/types/database";

interface ProductDialogProps {
  product?: ProductWithRelations;
  brands: Pick<Brand, "id" | "name">[];
  categories: Pick<Category, "id" | "name">[];
  units: Pick<Unit, "id" | "name" | "abbreviation">[];
}

export function ProductDialog({ product, brands, categories, units }: ProductDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!product;

  // Los selects controlados para poder leer su valor via hidden inputs
  const [brandId, setBrandId] = useState(product?.brand_id?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id?.toString() ?? "");
  const [unitId, setUnitId] = useState(product?.unit_id?.toString() ?? "");

  const action = isEditing
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.message) setOpen(false);
  }, [state]);

  // Resetear selects al abrir para creación
  useEffect(() => {
    if (open && !isEditing) {
      setBrandId("");
      setCategoryId("");
      setUnitId("");
    }
  }, [open, isEditing]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar producto</span>
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Hidden inputs para los selects controlados */}
          <input type="hidden" name="brand_id" value={brandId} />
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="unit_id" value={unitId} />

          {/* SKU y Nombre en grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku ?? ""}
                placeholder="ej: REP-001"
                className="uppercase"
                autoFocus
              />
              {state?.error?.sku && (
                <p className="text-xs text-destructive">{state.error.sku[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_id_select">Unidad</Label>
              <Select value={unitId} onValueChange={setUnitId}>
                <SelectTrigger id="unit_id_select">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name} ({u.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name ?? ""}
              placeholder="ej: Filtro de aceite Toyota Hilux"
            />
            {state?.error?.name && (
              <p className="text-xs text-destructive">{state.error.name[0]}</p>
            )}
          </div>

          {/* Marca y Categoría en grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand_id_select">Marca</Label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger id="brand_id_select">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id_select">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category_id_select">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              placeholder="Detalles adicionales del producto..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
