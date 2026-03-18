"use client";

import { useEffect, useActionState, useState } from "react";
import { Pencil, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { createSequence, updateSequence } from "@/actions/sequences";
import type { DocumentSequence } from "@/types/database";

interface SequenceDialogProps {
  sequence?: DocumentSequence;
}

export function SequenceDialog({ sequence }: SequenceDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!sequence;

  const action = isEditing
    ? updateSequence.bind(null, sequence.id)
    : createSequence;

  const [state, formAction, isPending] = useActionState(action, null);

  const [isAutomatic, setIsAutomatic] = useState(sequence?.is_automatic ?? true);
  const [isActive, setIsActive] = useState(sequence?.is_active ?? true);

  useEffect(() => {
    if (state?.message) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar serie</span>
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Serie
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Serie" : "Nueva Serie"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label>Tipo de Comprobante</Label>
            <Select
              name="doc_type"
              defaultValue={sequence?.doc_type ?? "Factura"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Factura">Factura</SelectItem>
                <SelectItem value="Boleta">Boleta</SelectItem>
              </SelectContent>
            </Select>
            {state?.error?.doc_type && (
              <p className="text-sm text-destructive">{state.error.doc_type[0]}</p>
            )}
          </div>

          {/* Serie */}
          <div className="space-y-2">
            <Label htmlFor="series">Serie</Label>
            <Input
              id="series"
              name="series"
              defaultValue={sequence?.series ?? ""}
              placeholder="ej: F001, B001"
              className="uppercase"
              autoFocus={!isEditing}
            />
            {state?.error?.series && (
              <p className="text-sm text-destructive">{state.error.series[0]}</p>
            )}
          </div>

          {/* Número actual */}
          <div className="space-y-2">
            <Label htmlFor="current_number">Número Actual</Label>
            <Input
              id="current_number"
              name="current_number"
              type="number"
              min="0"
              step="1"
              defaultValue={sequence?.current_number ?? 0}
            />
            <p className="text-xs text-muted-foreground">
              El próximo comprobante usará el número siguiente.
            </p>
            {state?.error?.current_number && (
              <p className="text-sm text-destructive">
                {state.error.current_number[0]}
              </p>
            )}
          </div>

          {/* Switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Numeración automática</p>
                <p className="text-xs text-muted-foreground">
                  El sistema asigna el número siguiente
                </p>
              </div>
              <Switch
                name="is_automatic"
                checked={isAutomatic}
                onCheckedChange={setIsAutomatic}
                value="true"
              />
              {/* campo oculto para enviar el valor correcto */}
              <input
                type="hidden"
                name="is_automatic"
                value={String(isAutomatic)}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Serie activa</p>
                <p className="text-xs text-muted-foreground">
                  Solo las series activas aparecen en el formulario de venta
                </p>
              </div>
              <Switch
                name="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
                value="true"
              />
              <input
                type="hidden"
                name="is_active"
                value={String(isActive)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear serie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
