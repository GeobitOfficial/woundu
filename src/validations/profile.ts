import { z } from "zod";

export const updateProfileSchema = z.object({
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
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
