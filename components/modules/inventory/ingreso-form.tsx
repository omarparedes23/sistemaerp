"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, PackagePlus } from "lucide-react";
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
import { createIngreso } from "@/actions/movements";
import type { Product, Warehouse } from "@/types/database";

type ProductOption = Pick<Product, "id" | "sku" | "name">;
type WarehouseOption = Pick<Warehouse, "id" | "name">;

interface LineItem {
  id: number; // clave local para React
  product_id: string;
  quantity: string;
}

const REASONS = [
  { value: "PURCHASE", label: "Compra / Importación" },
  { value: "INITIAL_LOAD", label: "Carga Inicial" },
  { value: "TRANSFER", label: "Transferencia entre almacenes" },
  { value: "INVENTORY_COUNT", label: "Ajuste de Inventario" },
] as const;

let nextId = 1;
function newItem(): LineItem {
  return { id: nextId++, product_id: "", quantity: "" };
}

interface IngresoFormProps {
  products: ProductOption[];
  warehouses: WarehouseOption[];
}

export function IngresoForm({ products, warehouses }: IngresoFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([newItem()]);
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createIngreso, null);

  // Redirigir al listado cuando el ingreso se procesa correctamente
  useEffect(() => {
    if (state?.message) {
      router.push("/almacenes/ingresos");
    }
  }, [state, router]);

  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateItem(id: number, field: keyof Omit<LineItem, "id">, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function handleSubmit(formData: FormData) {
    setFormError(null);

    // Validaciones locales antes de enviar
    if (!warehouseId) {
      setFormError("Selecciona un almacén de destino");
      return;
    }
    if (!reason) {
      setFormError("Selecciona el motivo del ingreso");
      return;
    }
    const validItems = items.filter(
      (i) => i.product_id !== "" && i.quantity !== "" && Number(i.quantity) > 0
    );
    if (validItems.length === 0) {
      setFormError("Agrega al menos un producto con cantidad válida");
      return;
    }

    // Serializar items y campos de los selects controlados
    formData.set("warehouse_id", warehouseId);
    formData.set("reason", reason);
    formData.set(
      "items",
      JSON.stringify(
        validItems.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
        }))
      )
    );

    formAction(formData);
  }

  // Productos ya seleccionados en otras filas (para evitar duplicados)
  const selectedProductIds = new Set(items.map((i) => i.product_id).filter(Boolean));

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* ── Cabecera del ingreso ─────────────────────────────── */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Datos del Documento
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="document_ref">N° de Documento</Label>
            <Input
              id="document_ref"
              name="document_ref"
              placeholder="ej: F001-00123"
              autoFocus
            />
            {state?.error?.document_ref && (
              <p className="text-xs text-destructive">{state.error.document_ref[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Almacén Destino</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar almacén..." />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.error?.warehouse_id && (
              <p className="text-xs text-destructive">{state.error.warehouse_id[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar motivo..." />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.error?.reason && (
              <p className="text-xs text-destructive">{state.error.reason[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Detalle de productos ─────────────────────────────── */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Productos a Ingresar
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1.5 h-4 w-4" />
            Agregar producto
          </Button>
        </div>

        {/* Encabezados de columna */}
        <div className="grid grid-cols-[1fr_140px_40px] gap-3 px-1">
          <span className="text-xs font-medium text-muted-foreground">Producto</span>
          <span className="text-xs font-medium text-muted-foreground">Cantidad</span>
          <span />
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_140px_40px] items-center gap-3">
              {/* Select de producto */}
              <Select
                value={item.product_id}
                onValueChange={(val) => updateItem(item.id, "product_id", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buscar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id.toString()}
                      disabled={
                        selectedProductIds.has(p.id.toString()) &&
                        item.product_id !== p.id.toString()
                      }
                    >
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {p.sku}
                      </span>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Cantidad */}
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                className="text-right"
              />

              {/* Botón eliminar fila */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
                className="h-10 w-10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Resumen rápido */}
        {items.filter((i) => i.quantity && Number(i.quantity) > 0).length > 0 && (
          <div className="text-right text-sm text-muted-foreground border-t pt-3">
            {items.filter((i) => i.product_id && Number(i.quantity) > 0).length} producto
            {items.filter((i) => i.product_id && Number(i.quantity) > 0).length !== 1 ? "s" : ""} ·{" "}
            {items
              .filter((i) => i.product_id && Number(i.quantity) > 0)
              .reduce((sum, i) => sum + Number(i.quantity), 0)
              .toFixed(2)}{" "}
            unidades totales
          </div>
        )}
      </div>

      {/* ── Error general y botones ─────────────────────────── */}
      {(formError || state?.error?.items) && (
        <p className="text-sm text-destructive">
          {formError ?? state?.error?.items?.[0]}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/almacenes/ingresos")}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PackagePlus className="mr-2 h-4 w-4" />
          )}
          Procesar Ingreso
        </Button>
      </div>
    </form>
  );
}
