import { z } from "zod";

import { MARKETPLACE_COUNTRIES } from "@/constants/marketplaceCountries";

const marketplaceCountryValues = MARKETPLACE_COUNTRIES as readonly string[];

const optionalComparePrice = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  return value;
}, z.coerce.number().positive("El precio de referencia debe ser mayor que 0.").optional());

const optionalBoolean = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "1" || value === "on";
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return false;
}, z.boolean());

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
        (value) => marketplaceCountryValues.includes(value),
        "Selecciona un país de la lista.",
      ),
    isOnOffer: optionalBoolean,
    compareAtPrice: optionalComparePrice,
    stock: z.coerce
      .number({ error: "Ingresa un stock valido." })
      .int("El stock debe ser un numero entero.")
      .min(1, "Debe haber al menos 1 unidad disponible.")
      .max(99999, "El stock no puede superar 99999 unidades."),
    shippingType: z.enum(["free", "paid"], {
      error: "Selecciona el tipo de envio.",
    }),
    specifications: z
      .array(
        z.object({
          key: z.string().trim().min(1, "El nombre de la característica no puede estar vacío."),
          value: z.string().trim().min(1, "El valor de la característica no puede estar vacío."),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isOnOffer && data.compareAtPrice == null) {
      ctx.addIssue({
        code: "custom",
        message: "Debes ingresar un precio de referencia para activar la oferta.",
        path: ["compareAtPrice"],
      });
    }

    if (data.isOnOffer && data.compareAtPrice != null && data.compareAtPrice <= data.price) {
      ctx.addIssue({
        code: "custom",
        message:
          "El precio de referencia debe ser mayor que el precio de venta para mostrar una oferta.",
        path: ["compareAtPrice"],
      });
    }
  });

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema;

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
