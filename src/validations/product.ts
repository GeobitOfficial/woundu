import { z } from "zod";

import { LATIN_AMERICA_COUNTRIES } from "@/constants/latinAmericaCountries";

const countryValues = LATIN_AMERICA_COUNTRIES as readonly string[];

const optionalComparePrice = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  return value;
}, z.coerce.number().positive("El precio de referencia debe ser mayor que 0.").optional());

export const createProductSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "El titulo debe tener al menos 3 caracteres.")
      .max(120, "El titulo no puede superar 120 caracteres."),
    description: z
      .string()
      .trim()
      .min(10, "La descripcion debe tener al menos 10 caracteres.")
      .max(3000, "La descripcion no puede superar 3000 caracteres."),
    price: z.coerce
      .number({ error: "Ingresa un precio valido." })
      .min(0, "El precio no puede ser negativo."),
    categoryId: z.string().uuid("Selecciona una categoria valida."),
    condition: z.enum(["new", "like_new", "used", "refurbished"], {
      error: "Selecciona una condicion valida.",
    }),
    city: z.string().trim().max(80, "La ciudad es demasiado larga.").optional(),
    country: z
      .string()
      .trim()
      .min(1, "Selecciona un país.")
      .refine(
        (value) => countryValues.includes(value),
        "Selecciona un país de la lista regional.",
      ),
    compareAtPrice: optionalComparePrice,
  })
  .superRefine((data, ctx) => {
    if (data.compareAtPrice != null && data.compareAtPrice <= data.price) {
      ctx.addIssue({
        code: "custom",
        message:
          "El precio de referencia debe ser mayor que el precio de venta para mostrar una oferta.",
        path: ["compareAtPrice"],
      });
    }
  });

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
