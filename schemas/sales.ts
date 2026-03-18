import { z } from "zod";

export const saleItemSchema = z.object({
  product_id: z
    .number({ invalid_type_error: "Selecciona un producto" })
    .int()
    .positive("Selecciona un producto"),
  quantity: z
    .number({ invalid_type_error: "Ingresa una cantidad válida" })
    .positive("La cantidad debe ser mayor a 0")
    .multipleOf(0.01, "Máximo 2 decimales"),
  unit_price: z
    .number({ invalid_type_error: "Ingresa un precio válido" })
    .positive("El precio debe ser mayor a 0")
    .multipleOf(0.01, "Máximo 2 decimales"),
  total_line: z
    .number({ invalid_type_error: "Total de línea inválido" })
    .positive()
    .multipleOf(0.01),
});

export const saleSchema = z.object({
  client_id: z
    .number({ invalid_type_error: "Selecciona un cliente" })
    .int()
    .positive("Selecciona un cliente"),
  warehouse_id: z
    .number({ invalid_type_error: "Selecciona un almacén" })
    .int()
    .positive("Selecciona un almacén"),
  doc_type: z.enum(["Factura", "Boleta"], {
    errorMap: () => ({ message: "Selecciona el tipo de comprobante" }),
  }),
  series: z
    .string()
    .min(1, "La serie es requerida")
    .max(10, "Máximo 10 caracteres")
    .trim(),
  number: z
    .string()
    .min(1, "El número es requerido")
    .max(20, "Máximo 20 caracteres")
    .trim(),
  // Totales calculados en el cliente y verificados en el server
  subtotal: z.number().min(0),
  tax_total: z.number().min(0),
  total: z.number().positive("El total debe ser mayor a 0"),
  items: z.array(saleItemSchema).min(1, "Agrega al menos un producto"),
  // Metadato: si el correlativo es automático, el server debe incrementarlo
  sequence_id: z.number().int().positive().optional(),
});

export type SaleFormValues = z.infer<typeof saleSchema>;
export type SaleItemValues = z.infer<typeof saleItemSchema>;
