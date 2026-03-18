import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres")
    .trim(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
