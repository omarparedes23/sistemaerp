import { z } from "zod";

export const warehouseSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres")
    .trim(),
  location: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  // El Switch usa un input hidden con 'true'/'false'
  is_active: z.preprocess((val) => val === "true", z.boolean()),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
