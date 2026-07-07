import { z } from "zod";

import { LATIN_AMERICA_COUNTRIES } from "@/constants/latinAmericaCountries";
import { isValidEmailFormat, normalizeEmail } from "@/utils/normalizeEmail";

const countryValues = LATIN_AMERICA_COUNTRIES as readonly string[];

const emailField = z
  .string()
  .transform(normalizeEmail)
  .refine(isValidEmailFormat, { message: "Ingresa un email valido." });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Ingresa tu contrasena."),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Ingresa tu nombre completo.")
      .max(80, "El nombre no puede superar 80 caracteres."),
    email: emailField,
    password: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contrasena."),
    country: z
      .string()
      .trim()
      .min(1, "Selecciona tu pais.")
      .refine((value) => countryValues.includes(value), {
        message: "Selecciona un pais valido de Latinoamerica.",
      }),
    role: z
      .enum(["buyer"], {
        error: "El registro público solo permite crear cuentas de comprador.",
      })
      .default("buyer"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
