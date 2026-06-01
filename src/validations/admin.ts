import { z } from "zod";

import type { ProductStatus } from "@/types";

const adminProductStatuses = [
  "draft",
  "pending_review",
  "active",
  "rejected",
  "paused",
  "sold",
  "archived",
] as const satisfies ReadonlyArray<ProductStatus>;

export const adminProductUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(120, "El título es demasiado largo."),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(3000, "La descripción es demasiado larga."),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  status: z.enum(adminProductStatuses),
  moderationNote: z
    .string()
    .trim()
    .max(500, "La nota de moderación es demasiado larga.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
});

export type AdminProductUpdateValues = z.infer<typeof adminProductUpdateSchema>;

import type { OrderStatus } from "@/types";

const adminOrderStatuses = [
  "pending",
  "paid",
  "processing",
  "completed",
  "cancelled",
  "refunded",
] as const satisfies ReadonlyArray<OrderStatus>;

export const adminOrderStatusSchema = z.object({
  status: z.enum(adminOrderStatuses),
  paymentReference: z
    .string()
    .trim()
    .max(120, "La referencia es demasiado larga.")
    .optional()
    .or(z.literal("")),
});

export type AdminOrderStatusValues = z.infer<typeof adminOrderStatusSchema>;

export const adminUserBanSchema = z.object({
  isBanned: z.boolean(),
  banReason: z
    .string()
    .trim()
    .max(240, "El motivo es demasiado largo.")
    .optional()
    .or(z.literal("")),
});

export type AdminUserBanValues = z.infer<typeof adminUserBanSchema>;
