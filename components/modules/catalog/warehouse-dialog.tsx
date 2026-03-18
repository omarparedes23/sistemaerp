"use client";

import { useEffect, useActionState, useState } from "react";
import { Pencil, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createWarehouse, updateWarehouse } from "@/actions/warehouses";
import type { Warehouse } from "@/types/database";

interface WarehouseDialogProps {
  warehouse?: Warehouse;
}

export function WarehouseDialog({ warehouse }: WarehouseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(warehouse?.is_active ?? true);
  const isEditing = !!warehouse;

  const action = isEditing
    ? updateWarehouse.bind(null, warehouse.id)
    : createWarehouse;

  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.message) setOpen(false);
  }, [state]);

  // Resetear el switch al abrir para creación
  useEffect(() => {
    if (open && !isEditing) setIsActive(true);
  }, [open, isEditing]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar almacén</span>
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Almacén
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Almacén" : "Nuevo Almacén"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Hidden input controlado por el Switch */}
          <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={warehouse?.name ?? ""}
              placeholder="ej: Tienda Principal, Depósito Sur..."
              autoFocus
            />
            {state?.error?.name && (
              <p className="text-sm text-destructive">{state.error.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación (opcional)</Label>
            <Input
              id="location"
              name="location"
              defaultValue={warehouse?.location ?? ""}
              placeholder="ej: Av. Industrial 123, Lima"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active_switch" className="text-sm font-medium">
                Almacén activo
              </Label>
              <p className="text-xs text-muted-foreground">
                Los almacenes inactivos no aparecen en los formularios de movimientos
              </p>
            </div>
            <Switch
              id="is_active_switch"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear almacén"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
