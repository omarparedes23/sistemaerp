"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Receipt, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSale } from "@/actions/sales";
import type { ActionState } from "@/actions/brands";
import type { Client, Product, Warehouse, DocumentSequence } from "@/types/database";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ClientOption = Pick<Client, "id" | "type" | "number" | "name">;
type ProductOption = Pick<Product, "id" | "sku" | "name">;
type WarehouseOption = Pick<Warehouse, "id" | "name">;
type SequenceOption = Pick<
  DocumentSequence,
  "id" | "series" | "current_number" | "is_automatic"
>;

type DocType = "Factura" | "Boleta";

interface LineItem {
  uid: number;
  product_id: string;
  quantity: string;
  unit_price: string;
}

interface SaleFormProps {
  clients: ClientOption[];
  products: ProductOption[];
  warehouses: WarehouseOption[];
  /** Series activas agrupadas por tipo de comprobante */
  sequences: { Factura: SequenceOption[]; Boleta: SequenceOption[] };
  /**
   * Mapa de stock disponible: warehouseId → productId → current_stock
   * Cargado desde stock_levels en el Server Component.
   */
  stockMap: Record<number, Record<number, number>>;
}

// ─── Constantes y helpers ─────────────────────────────────────────────────────

const IGV_RATE = 0.18;
const PAD = 5;

function padNumber(n: number) {
  return String(n + 1).padStart(PAD, "0");
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Factura: precios SIN IGV → subtotal es base, se suma IGV encima.
 */
function calcFactura(items: LineItem[]) {
  const subtotal = items.reduce(
    (s, i) => s + Number(i.quantity) * Number(i.unit_price),
    0
  );
  const tax_total = round2(subtotal * IGV_RATE);
  return {
    subtotal: round2(subtotal),
    tax_total,
    total: round2(subtotal + tax_total),
  };
}

/**
 * Boleta: precios CON IGV incluido → total es suma de líneas,
 * se desagrega el IGV para obtener la base.
 */
function calcBoleta(items: LineItem[]) {
  const total = items.reduce(
    (s, i) => s + Number(i.quantity) * Number(i.unit_price),
    0
  );
  const subtotal = round2(total / (1 + IGV_RATE));
  const tax_total = round2(total - subtotal);
  return { subtotal, tax_total, total: round2(total) };
}

function fmt(n: number) {
  return n.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

let nextUid = 1;
function newItem(): LineItem {
  return { uid: nextUid++, product_id: "", quantity: "", unit_price: "" };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SaleForm({
  clients,
  products,
  warehouses,
  sequences,
  stockMap,
}: SaleFormProps) {
  const router = useRouter();

  // ── Estado ────────────────────────────────────────────────────────────────
  const [clientId, setClientId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [docType, setDocType] = useState<DocType>("Factura");
  const [seriesId, setSeriesId] = useState("");
  const [manualNumber, setManualNumber] = useState("");
  const [items, setItems] = useState<LineItem[]>([newItem()]);
  const [formError, setFormError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createSale, null);

  // ── Correlativos ──────────────────────────────────────────────────────────
  const availableSeqs = sequences[docType] ?? [];

  useEffect(() => {
    const first = availableSeqs[0];
    setSeriesId(first ? String(first.id) : "");
    setManualNumber("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docType]);

  const selectedSeq =
    availableSeqs.find((s) => String(s.id) === seriesId) ?? null;
  const isAutomatic = selectedSeq?.is_automatic ?? true;
  const suggestedNumber = selectedSeq ? padNumber(selectedSeq.current_number) : "";

  // ── Stock disponible para el almacén seleccionado ─────────────────────────
  const warehouseStock: Record<number, number> = warehouseId
    ? (stockMap[Number(warehouseId)] ?? {})
    : {};

  function getAvailableStock(productId: string): number | null {
    if (!warehouseId || !productId) return null;
    return warehouseStock[Number(productId)] ?? 0;
  }

  // ── Cálculo de totales ────────────────────────────────────────────────────
  const validItems = useMemo(
    () =>
      items.filter(
        (i) =>
          i.product_id !== "" &&
          Number(i.quantity) > 0 &&
          Number(i.unit_price) > 0
      ),
    [items]
  );

  const totals = useMemo(() => {
    if (validItems.length === 0) return { subtotal: 0, tax_total: 0, total: 0 };
    return docType === "Factura" ? calcFactura(validItems) : calcBoleta(validItems);
  }, [validItems, docType]);

  // ── Hay algún ítem con stock insuficiente ─────────────────────────────────
  const hasStockWarning = useMemo(
    () =>
      warehouseId
        ? items.some((i) => {
            const available = getAvailableStock(i.product_id);
            return available !== null && Number(i.quantity) > available;
          })
        : false,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, warehouseId]
  );

  // ── Gestión de ítems ──────────────────────────────────────────────────────
  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(uid: number) {
    setItems((prev) => prev.filter((i) => i.uid !== uid));
  }

  function updateItem(
    uid: number,
    field: keyof Omit<LineItem, "uid">,
    value: string
  ) {
    setItems((prev) =>
      prev.map((i) => (i.uid === uid ? { ...i, [field]: value } : i))
    );
  }

  // ── Envío ─────────────────────────────────────────────────────────────────
  function handleSubmit(formData: FormData) {
    setFormError(null);

    if (!clientId) {
      setFormError("Selecciona un cliente");
      return;
    }
    if (!warehouseId) {
      setFormError("Selecciona un almacén de salida");
      return;
    }
    if (!seriesId) {
      setFormError(
        "Selecciona una serie activa para este tipo de comprobante"
      );
      return;
    }

    const docNumber = isAutomatic ? suggestedNumber : manualNumber.trim();
    if (!docNumber) {
      setFormError("El número de comprobante es requerido");
      return;
    }
    if (validItems.length === 0) {
      setFormError(
        "Agrega al menos un producto con cantidad y precio válidos"
      );
      return;
    }

    const itemsPayload = validItems.map((i) => ({
      product_id: Number(i.product_id),
      quantity: Number(i.quantity),
      unit_price: Number(i.unit_price),
      total_line: round2(Number(i.quantity) * Number(i.unit_price)),
    }));

    formData.set("client_id", clientId);
    formData.set("warehouse_id", warehouseId);
    formData.set("doc_type", docType);
    formData.set("series", selectedSeq?.series ?? "");
    formData.set("number", docNumber);
    formData.set("subtotal", String(totals.subtotal));
    formData.set("tax_total", String(totals.tax_total));
    formData.set("total", String(totals.total));
    formData.set("items", JSON.stringify(itemsPayload));
    if (isAutomatic && selectedSeq) {
      formData.set("sequence_id", String(selectedSeq.id));
    }

    formAction(formData);
  }

  const selectedProductIds = new Set(
    items.map((i) => i.product_id).filter(Boolean)
  );

  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <form action={handleSubmit} className="space-y-6">

      {/* ── Cabecera del comprobante ─────────────────────────────────────── */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Datos del Comprobante
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cliente */}
          <div className="space-y-2 sm:col-span-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">
                      [{c.type}] {c.number}
                    </span>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.error?.client_id && (
              <p className="text-xs text-destructive">
                {state.error.client_id[0]}
              </p>
            )}
          </div>

          {/* Almacén de salida */}
          <div className="space-y-2">
            <Label>Almacén de Salida</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar almacén..." />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.error?.warehouse_id && (
              <p className="text-xs text-destructive">
                {state.error.warehouse_id[0]}
              </p>
            )}
          </div>

          {/* Tipo de comprobante */}
          <div className="space-y-2">
            <Label>Tipo de Comprobante</Label>
            <Select
              value={docType}
              onValueChange={(v) => setDocType(v as DocType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Factura">Factura</SelectItem>
                <SelectItem value="Boleta">Boleta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Serie + Número */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Serie</Label>
            {availableSeqs.length === 0 ? (
              <p className="text-sm text-destructive">
                No hay series activas para {docType}. Configura una en{" "}
                <a href="/ventas/correlativos" className="underline">
                  Correlativos
                </a>
                .
              </p>
            ) : (
              <Select value={seriesId} onValueChange={setSeriesId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar serie..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSeqs.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.series}
                      {s.is_automatic && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (auto)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="doc_number">Número</Label>
              {isAutomatic && (
                <Badge variant="secondary" className="text-xs">
                  Automático
                </Badge>
              )}
            </div>
            <Input
              id="doc_number"
              value={isAutomatic ? suggestedNumber : manualNumber}
              onChange={(e) =>
                !isAutomatic && setManualNumber(e.target.value)
              }
              readOnly={isAutomatic}
              placeholder={isAutomatic ? suggestedNumber : "ej: 00001"}
              className={
                isAutomatic ? "bg-muted text-muted-foreground cursor-default" : ""
              }
            />
            {state?.error?.number && (
              <p className="text-xs text-destructive">
                {state.error.number[0]}
              </p>
            )}
          </div>
        </div>

        {/* Nota IGV */}
        <p className="text-xs text-muted-foreground">
          {docType === "Factura"
            ? "Factura: ingresa precios sin IGV. El sistema calcula el IGV (18%) sobre la base imponible."
            : "Boleta: ingresa precios con IGV incluido. El sistema desagrega el IGV automáticamente."}
        </p>
      </div>

      {/* ── Detalle de productos ─────────────────────────────────────────── */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Productos a Vender
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1.5 h-4 w-4" />
            Agregar producto
          </Button>
        </div>

        {/* Encabezados de columna */}
        <div className="grid grid-cols-[1fr_120px_130px_110px_40px] gap-3 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            Producto
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Cantidad
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Precio {docType === "Factura" ? "s/IGV" : "c/IGV"} (S/)
          </span>
          <span className="text-xs font-medium text-muted-foreground text-right">
            Total Línea
          </span>
          <span />
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const lineTotal =
              Number(item.quantity) > 0 && Number(item.unit_price) > 0
                ? round2(Number(item.quantity) * Number(item.unit_price))
                : 0;

            const available = getAvailableStock(item.product_id);
            const isOverStock =
              available !== null &&
              Number(item.quantity) > 0 &&
              Number(item.quantity) > available;

            return (
              <div key={item.uid} className="space-y-1">
                <div className="grid grid-cols-[1fr_120px_130px_110px_40px] items-center gap-3">
                  {/* Producto */}
                  <Select
                    value={item.product_id}
                    onValueChange={(v) =>
                      updateItem(item.uid, "product_id", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar producto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={String(p.id)}
                          disabled={
                            selectedProductIds.has(String(p.id)) &&
                            item.product_id !== String(p.id)
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
                    onChange={(e) =>
                      updateItem(item.uid, "quantity", e.target.value)
                    }
                    className={`text-right ${isOverStock ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />

                  {/* Precio unitario */}
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(item.uid, "unit_price", e.target.value)
                    }
                    className="text-right"
                  />

                  {/* Total línea */}
                  <div className="text-right text-sm font-medium tabular-nums">
                    {lineTotal > 0 ? `S/ ${fmt(lineTotal)}` : "—"}
                  </div>

                  {/* Eliminar */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.uid)}
                    disabled={items.length === 1}
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Indicador de stock disponible */}
                {item.product_id && warehouseId && available !== null && (
                  <div
                    className={`flex items-center gap-1 text-xs pl-1 ${
                      isOverStock
                        ? "text-destructive font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isOverStock && (
                      <AlertCircle className="h-3 w-3 shrink-0" />
                    )}
                    <span>
                      {isOverStock
                        ? `Stock insuficiente — disponible: ${available}`
                        : `Disponible: ${available}`}
                    </span>
                  </div>
                )}
                {item.product_id && warehouseId && available === null && (
                  <p className="text-xs text-muted-foreground pl-1">
                    Sin stock registrado en este almacén
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumen de totales */}
        {validItems.length > 0 && (
          <div className="border-t pt-4 mt-2">
            <div className="ml-auto w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Base imponible{" "}
                  <span className="text-xs">(sin IGV)</span>
                </span>
                <span className="tabular-nums">S/ {fmt(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IGV (18%)</span>
                <span className="tabular-nums">S/ {fmt(totals.tax_total)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-1.5">
                <span>Total</span>
                <span className="text-green-600 tabular-nums">
                  S/ {fmt(totals.total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Advertencia de stock + errores de servidor ───────────────────── */}
      {hasStockWarning && !formError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Uno o más productos superan el stock disponible. Ajusta las
            cantidades antes de continuar.
          </span>
        </div>
      )}

      {(formError || state?.error?.items) && (
        <p className="text-sm text-destructive">
          {formError ?? state?.error?.items?.[0]}
        </p>
      )}

      {/* ── Botones de acción ────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/ventas")}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || hasStockWarning} size="lg">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Receipt className="mr-2 h-4 w-4" />
          )}
          Emitir {docType}
        </Button>
      </div>
    </form>
  );
}
