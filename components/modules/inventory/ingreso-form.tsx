"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, PackagePlus, Pencil } from "lucide-react";
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
import type { ActionState } from "@/actions/brands";
import type { Product, Warehouse } from "@/types/database";

type ProductOption = Pick<Product, "id" | "sku" | "name">;
type WarehouseOption = Pick<Warehouse, "id" | "name">;
type FormAction = (_prevState: ActionState, formData: FormData) => Promise<ActionState>;

interface LineItem {
  id: number;
  product_id: string;
  quantity: string;
  unit_cost: string;
}

export interface IngresoInitialData {
  id: number;
  document_ref: string;
  warehouse_id: number;
  reason: string;
  product_id: number;
  product_sku: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
}

const REASONS = [
  { value: "PURCHASE", label: "Compra / Importación" },
  { value: "INITIAL_LOAD", label: "Carga Inicial" },
  { value: "TRANSFER", label: "Transferencia entre almacenes" },
  { value: "INVENTORY_COUNT", label: "Ajuste de Inventario" },
] as const;

let nextId = 1;
function newItem(): LineItem {
  return { id: nextId++, product_id: "", quantity: "", unit_cost: "" };
}

interface IngresoFormProps {
  products: ProductOption[];
  warehouses: WarehouseOption[];
  mode?: "create" | "edit";
  initialData?: IngresoInitialData;
  serverAction?: FormAction;
}

export function IngresoForm({
  products,
  warehouses,
  mode = "create",
  initialData,
  serverAction = createIngreso,
}: IngresoFormProps) {
  const router = useRouter();

  const [items, setItems] = useState<LineItem[]>(() =>
    mode === "edit" && initialData
      ? [{
          id: 1,
          product_id: String(initialData.product_id),
          quantity: String(initialData.quantity),
          unit_cost: String(initialData.unit_cost),
        }]
      : [newItem()]
  );
  const [warehouseId, setWarehouseId] = useState(
    mode === "edit" && initialData ? String(initialData.warehouse_id) : ""
  );
  const [reason, setReason] = useState(
    mode === "edit" && initialData ? initialData.reason : ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(serverAction, null);

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

    if (!warehouseId) {
      setFormError("Selecciona un almacén de destino");
      return;
    }
    if (!reason) {
      setFormError("Selecciona el motivo del ingreso");
      return;
    }
    const validItems = items.filter(
      (i) =>
        i.product_id !== "" &&
        i.quantity !== "" &&
        Number(i.quantity) > 0 &&
        i.unit_cost !== ""
    );
    if (validItems.length === 0) {
      setFormError("Agrega al menos un producto con cantidad y costo válidos");
      return;
    }

    formData.set("warehouse_id", warehouseId);
    formData.set("reason", reason);
    formData.set(
      "items",
      JSON.stringify(
        validItems.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          unit_cost: Number(i.unit_cost),
        }))
      )
    );

    formAction(formData);
  }

  const selectedProductIds = new Set(items.map((i) => i.product_id).filter(Boolean));

  // Cálculo del total del documento
  const validItems = items.filter(
    (i) => i.product_id && Number(i.quantity) > 0 && i.unit_cost !== ""
  );
  const totalUnits = validItems.reduce((sum, i) => sum + Number(i.quantity), 0);
  const totalCost = validItems.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unit_cost),
    0
  );

  const isEdit = mode === "edit";

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
              defaultValue={initialData?.document_ref ?? ""}
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
          {!isEdit && (
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1.5 h-4 w-4" />
              Agregar producto
            </Button>
          )}
        </div>

        {/* Encabezados de columna — ocultos en móvil */}
        <div className="hidden sm:grid grid-cols-[1fr_110px_130px_40px] gap-3 px-1">
          <span className="text-xs font-medium text-muted-foreground">Producto</span>
          <span className="text-xs font-medium text-muted-foreground">Cantidad</span>
          <span className="text-xs font-medium text-muted-foreground">Costo Unit. (S/)</span>
          <span />
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-md border p-3 sm:border-0 sm:p-0 sm:grid sm:grid-cols-[1fr_110px_130px_40px] sm:items-center sm:gap-3"
            >
              {/* Select de producto */}
              <Select
                value={item.product_id}
                onValueChange={(val) => updateItem(item.id, "product_id", val)}
                disabled={isEdit}
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
                        !isEdit &&
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

              {/* Cantidad, costo y eliminar — en fila en móvil */}
              <div className="grid grid-cols-[1fr_1fr_40px] gap-2 sm:contents">
                {/* Cantidad */}
                <div className="sm:contents">
                  <label className="text-xs font-medium text-muted-foreground sm:hidden">Cantidad</label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    className="text-right"
                  />
                </div>

                {/* Costo unitario */}
                <div className="sm:contents">
                  <label className="text-xs font-medium text-muted-foreground sm:hidden">Costo Unit. (S/)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unit_cost}
                    onChange={(e) => updateItem(item.id, "unit_cost", e.target.value)}
                    className="text-right"
                  />
                </div>

                {/* Botón eliminar fila */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1 || isEdit}
                  className="h-10 w-10 text-muted-foreground hover:text-destructive self-end"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del documento */}
        {validItems.length > 0 && (
          <div className="border-t pt-4 mt-2 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>
                {validItems.length} producto{validItems.length !== 1 ? "s" : ""} ·{" "}
                {totalUnits % 1 === 0 ? totalUnits : totalUnits.toFixed(2)} unidades
              </span>
              <span className="font-semibold text-foreground">
                Total:{" "}
                <span className="text-green-600 font-bold">
                  S/{" "}
                  {totalCost.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Error general y botones ─────────────────────────── */}
      {(formError || state?.error?.items) && (
        <p className="text-sm text-destructive">
          {formError ?? state?.error?.items?.[0]}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/almacenes/ingresos")}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} size="lg" className="w-full sm:w-auto">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEdit ? (
            <Pencil className="mr-2 h-4 w-4" />
          ) : (
            <PackagePlus className="mr-2 h-4 w-4" />
          )}
          {isEdit ? "Guardar Cambios" : "Procesar Ingreso"}
        </Button>
      </div>
    </form>
  );
}
