import { z } from "zod";

export const ingresoItemSchema = z.object({
  product_id: z
    .number({ invalid_type_error: "Selecciona un producto" })
    .int()
    .positive("Selecciona un producto"),
  quantity: z
    .number({ invalid_type_error: "Ingresa una cantidad válida" })
    .positive("La cantidad debe ser mayor a 0")
    .multipleOf(0.01, "Máximo 2 decimales"),
  unit_cost: z
    .number({ invalid_type_error: "Ingresa un costo válido" })
    .min(0, "El costo no puede ser negativo")
    .multipleOf(0.01, "Máximo 2 decimales"),
});

export const ingresoSchema = z.object({
  document_ref: z
    .string()
    .min(1, "El número de documento es requerido")
    .max(50, "Máximo 50 caracteres")
    .trim(),
  warehouse_id: z
    .number({ invalid_type_error: "Selecciona un almacén" })
    .int()
    .positive("Selecciona un almacén"),
  reason: z.enum(
    ["PURCHASE", "INITIAL_LOAD", "TRANSFER", "INVENTORY_COUNT"],
    { errorMap: () => ({ message: "Selecciona un motivo válido" }) }
  ),
  items: z
    .array(ingresoItemSchema)
    .min(1, "Agrega al menos un producto"),
});

export type IngresoFormValues = z.infer<typeof ingresoSchema>;
