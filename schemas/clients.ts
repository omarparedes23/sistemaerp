import { z } from "zod";

export const clientSchema = z.object({
  type: z.enum(["DNI", "RUC", "Otros"], {
    errorMap: () => ({ message: "Selecciona un tipo de documento válido" }),
  }),
  number: z
    .string()
    .min(1, "El número de documento es requerido")
    .max(20, "Máximo 20 caracteres")
    .trim(),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "Máximo 150 caracteres")
    .trim(),
  address: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Ingresa un correo válido")
    .max(100, "Máximo 100 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
