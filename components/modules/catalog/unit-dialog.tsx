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
import { createUnit, updateUnit } from "@/actions/units";
import type { Unit } from "@/types/database";

interface UnitDialogProps {
  unit?: Unit;
}

export function UnitDialog({ unit }: UnitDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!unit;

  const action = isEditing
    ? updateUnit.bind(null, unit.id)
    : createUnit;

  const [state, formAction, isPending] = useActionState(action, null);

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
            <span className="sr-only">Editar unidad</span>
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Unidad
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Unidad" : "Nueva Unidad de Medida"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={unit?.name ?? ""}
              placeholder="ej: Unidades, Litros, Kilogramos..."
              autoFocus
            />
            {state?.error?.name && (
              <p className="text-sm text-destructive">{state.error.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Abreviatura</Label>
            <Input
              id="abbreviation"
              name="abbreviation"
              defaultValue={unit?.abbreviation ?? ""}
              placeholder="ej: UND, LTS, KGS..."
              className="uppercase"
            />
            {state?.error?.abbreviation && (
              <p className="text-sm text-destructive">{state.error.abbreviation[0]}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear unidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
