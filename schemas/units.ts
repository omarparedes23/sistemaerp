import { z } from "zod";

export const unitSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres")
    .trim(),
  abbreviation: z
    .string()
    .min(1, "La abreviatura es requerida")
    .max(10, "Máximo 10 caracteres")
    .trim()
    .toUpperCase(),
});

export type UnitFormValues = z.infer<typeof unitSchema>;
