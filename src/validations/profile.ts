import { z } from "zod";

import { LATIN_AMERICA_COUNTRIES } from "@/constants/latinAmericaCountries";
import { canAccessSellerFeatures } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

const profileCountryValues = LATIN_AMERICA_COUNTRIES as readonly string[];

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Ingresa un telefono valido.")
  .max(20, "El telefono es demasiado largo.")
  .regex(
    /^[0-9+\s()-]+$/,
    "Usa solo numeros y caracteres basicos de telefono.",
  );

const whatsappSchema = z
  .string()
  .trim()
  .min(8, "Ingresa un WhatsApp valido con codigo de pais.")
  .max(20, "El numero es demasiado largo.")
  .regex(/^[0-9]+$/, "Solo numeros, incluye el codigo de pais sin el signo +.");

export const updateProfileBaseSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre.")
    .max(80, "El nombre no puede superar 80 caracteres."),
  username: z
    .string()
    .trim()
    .max(32, "El usuario no puede superar 32 caracteres.")
    .regex(
      /^$|^[a-zA-Z0-9_]{3,32}$/,
      "Dejalo vacio o usa entre 3 y 32 caracteres (letras, numeros, _).",
    )
    .transform((value) => (value === "" ? undefined : value)),
  bio: z
    .string()
    .trim()
    .max(500, "La bio no puede superar 500 caracteres.")
    .transform((value) => (value === "" ? undefined : value)),
  country: z
    .string()
    .trim()
    .min(1, "Selecciona tu pais.")
    .refine((value) => profileCountryValues.includes(value), {
      message: "Selecciona un pais valido de Latinoamerica.",
    }),
});

export const buyerShippingProfileSchema = z.object({
  shippingCity: z
    .string()
    .trim()
    .min(2, "Ingresa tu ciudad de envio.")
    .max(80, "La ciudad es demasiado larga."),
  shippingAddress: z
    .string()
    .trim()
    .min(5, "Ingresa tu direccion de envio.")
    .max(200, "La direccion es demasiado larga."),
  phone: phoneSchema,
});

export const sellerWhatsappProfileSchema = z.object({
  whatsapp: whatsappSchema,
});

export type UpdateProfileFormValues =
  | (z.infer<typeof updateProfileBaseSchema> &
      z.infer<typeof buyerShippingProfileSchema>)
  | (z.infer<typeof updateProfileBaseSchema> &
      z.infer<typeof sellerWhatsappProfileSchema>)
  | z.infer<typeof updateProfileBaseSchema>;

export function buildUpdateProfileSchema(role: UserRole) {
  if (role === "buyer") {
    return updateProfileBaseSchema.merge(buyerShippingProfileSchema);
  }

  if (canAccessSellerFeatures(role)) {
    return updateProfileBaseSchema.merge(sellerWhatsappProfileSchema);
  }

  return updateProfileBaseSchema;
}

/** @deprecated Usa buildUpdateProfileSchema(role) */
export const updateProfileSchema = updateProfileBaseSchema;
