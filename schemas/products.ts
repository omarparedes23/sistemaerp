import { z } from "zod";

export const productSchema = z.object({
  sku: z
    .string()
    .min(1, "El SKU es requerido")
    .max(50, "Máximo 50 caracteres")
    .trim()
    .toUpperCase(),
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "Máximo 200 caracteres")
    .trim(),
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  // IDs opcionales — el producto puede crearse sin clasificar aún
  category_id: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z.number().int().positive().nullable()
  ),
  brand_id: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z.number().int().positive().nullable()
  ),
  unit_id: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z.number().int().positive().nullable()
  ),
});

export type ProductFormValues = z.infer<typeof productSchema>;
