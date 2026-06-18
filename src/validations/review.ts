import { z } from "zod";

export const productReviewSchema = z.object({
  productId: z.string().uuid("Producto no válido."),
  sellerId: z.string().uuid("Vendedor no válido."),
  rating: z.coerce
    .number()
    .int("La calificación debe ser un número entero.")
    .min(1, "La calificación mínima es 1 estrella.")
    .max(5, "La calificación máxima es 5 estrellas."),
  comment: z
    .string()
    .trim()
    .max(1000, "El comentario no puede superar 1000 caracteres.")
    .optional()
    .transform((value) => (value ? value : null)),
});

export type ProductReviewFormValues = z.infer<typeof productReviewSchema>;
