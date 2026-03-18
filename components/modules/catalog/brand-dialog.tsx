"use client";

import { useEffect, useActionState, useState } from "react";
import { Pencil, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBrand, updateBrand } from "@/actions/brands";
import type { Brand } from "@/types/database";

interface BrandDialogProps {
  brand?: Brand; // Si viene, es modo edición
}

export function BrandDialog({ brand }: BrandDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!brand;

  const action = isEditing
    ? updateBrand.bind(null, brand.id)
    : createBrand;

  const [state, formAction, isPending] = useActionState(action, null);

  // Cerrar el dialog automáticamente al éxito
  useEffect(() => {
    if (state?.message) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar marca</span>
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Marca
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Marca" : "Nueva Marca"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={brand?.name ?? ""}
              placeholder="ej: Toyota, Bosch, NGK..."
              autoFocus
            />
            {state?.error?.name && (
              <p className="text-sm text-destructive">{state.error.name[0]}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear marca"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
