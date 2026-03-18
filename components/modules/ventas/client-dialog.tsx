"use client";

import { useEffect, useActionState, useState } from "react";
import { Pencil, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createClient, updateClient } from "@/actions/clients";
import type { Client } from "@/types/database";

interface ClientDialogProps {
  client?: Client;
}

export function ClientDialog({ client }: ClientDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!client;

  const action = isEditing
    ? updateClient.bind(null, client.id)
    : createClient;

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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar cliente</span>
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Tipo y Número de documento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo Doc.</Label>
              <Select name="type" defaultValue={client?.type ?? "RUC"}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUC">RUC</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
              {state?.error?.type && (
                <p className="text-sm text-destructive">{state.error.type[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Nro. Documento</Label>
              <Input
                id="number"
                name="number"
                defaultValue={client?.number ?? ""}
                placeholder="ej: 20100047218"
                maxLength={20}
              />
              {state?.error?.number && (
                <p className="text-sm text-destructive">{state.error.number[0]}</p>
              )}
            </div>
          </div>

          {/* Nombre / Razón Social */}
          <div className="space-y-2">
            <Label htmlFor="name">Razón Social / Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={client?.name ?? ""}
              placeholder="ej: Empresa SAC"
              autoFocus={!isEditing}
            />
            {state?.error?.name && (
              <p className="text-sm text-destructive">{state.error.name[0]}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Dirección{" "}
              <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Input
              id="address"
              name="address"
              defaultValue={client?.address ?? ""}
              placeholder="ej: Av. Lima 123, Lima"
            />
            {state?.error?.address && (
              <p className="text-sm text-destructive">{state.error.address[0]}</p>
            )}
          </div>

          {/* Email y Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email{" "}
                <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email ?? ""}
                placeholder="correo@empresa.com"
              />
              {state?.error?.email && (
                <p className="text-sm text-destructive">{state.error.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Teléfono{" "}
                <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={client?.phone ?? ""}
                placeholder="ej: 999-888-777"
                maxLength={20}
              />
              {state?.error?.phone && (
                <p className="text-sm text-destructive">{state.error.phone[0]}</p>
              )}
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
              {isEditing ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
