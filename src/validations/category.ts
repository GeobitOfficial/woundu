import { z } from "zod";

import { CATEGORY_ICON_OPTIONS } from "@/constants/categoryIcons";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre es demasiado largo."),
  slug: z
    .string()
    .trim()
    .min(2, "El slug debe tener al menos 2 caracteres.")
    .max(80, "El slug es demasiado largo.")
    .regex(slugPattern, "Usa solo letras minúsculas, números y guiones."),
  description: z
    .string()
    .trim()
    .max(240, "La descripción es demasiado larga.")
    .optional()
    .or(z.literal("")),
  icon: z.enum(CATEGORY_ICON_OPTIONS, {
    message: "Selecciona un icono válido.",
  }),
  sortOrder: z.coerce
    .number()
    .int("Debe ser un número entero.")
    .min(0, "El orden no puede ser negativo.")
    .max(9999, "El orden es demasiado alto."),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function slugifyCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
