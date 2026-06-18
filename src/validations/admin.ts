import { z } from "zod";

import type { OrderStatus, ProductStatus, UserRole } from "@/types";

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

const assignableUserRoles = [
  "buyer",
  "seller",
  "admin",
  "super_admin",
] as const satisfies ReadonlyArray<UserRole>;

export const adminUserRoleSchema = z.object({
  role: z.enum(assignableUserRoles),
});

export type AdminUserRoleValues = z.infer<typeof adminUserRoleSchema>;

export const adminUserLocaleSchema = z.object({
  country: z
    .string()
    .trim()
    .min(2, "Selecciona un país válido.")
    .max(80, "El país es demasiado largo."),
  currency: z
    .string()
    .trim()
    .length(3, "La moneda debe tener 3 caracteres (ISO).")
    .optional()
    .or(z.literal("")),
});

export type AdminUserLocaleValues = z.infer<typeof adminUserLocaleSchema>;

export const adminCountryCurrencySchema = z.object({
  country: z.string().trim().min(2).max(80),
  currency: z
    .string()
    .trim()
    .length(3, "La moneda debe tener 3 caracteres (ISO).")
    .transform((value) => value.toUpperCase()),
});

export type AdminCountryCurrencyValues = z.infer<typeof adminCountryCurrencySchema>;

export const adminProductModerationSchema = z.object({
  status: z.enum(["active", "rejected"]),
  moderationNote: z
    .string()
    .trim()
    .max(500, "La nota de moderación es demasiado larga.")
    .optional()
    .or(z.literal("")),
});

export type AdminProductModerationValues = z.infer<
  typeof adminProductModerationSchema
>;

export const adminProductRestoreSchema = z.object({
  status: z.enum(["draft", "paused", "active"]).default("paused"),
});

export type AdminProductRestoreValues = z.infer<typeof adminProductRestoreSchema>;

export const adminOrderPaymentSchema = z.object({
  paymentReference: z
    .string()
    .trim()
    .min(3, "La referencia debe tener al menos 3 caracteres.")
    .max(120, "La referencia es demasiado larga."),
});

export type AdminOrderPaymentValues = z.infer<typeof adminOrderPaymentSchema>;

export const adminOrderRefundSchema = z.object({
  refundAmount: z.coerce
    .number()
    .min(0.01, "El monto del reembolso debe ser mayor a cero."),
  refundReason: z
    .string()
    .trim()
    .min(10, "Describe el motivo del reembolso (mín. 10 caracteres).")
    .max(500, "El motivo es demasiado largo."),
  paymentReference: z
    .string()
    .trim()
    .max(120, "La referencia es demasiado larga.")
    .optional()
    .or(z.literal("")),
});

export type AdminOrderRefundValues = z.infer<typeof adminOrderRefundSchema>;

const orderDisputeStatuses = [
  "open",
  "under_review",
  "approved_refund",
  "rejected",
  "closed",
] as const;

export const adminDisputeCreateSchema = z.object({
  orderId: z.string().uuid("Selecciona un pedido válido."),
  reason: z
    .string()
    .trim()
    .min(10, "El motivo debe tener al menos 10 caracteres.")
    .max(500, "El motivo es demasiado largo."),
  buyerNote: z
    .string()
    .trim()
    .max(1000, "La nota es demasiado larga.")
    .optional()
    .or(z.literal("")),
});

export type AdminDisputeCreateValues = z.infer<typeof adminDisputeCreateSchema>;

export const adminDisputeResolveSchema = z.object({
  status: z.enum(orderDisputeStatuses),
  adminNote: z
    .string()
    .trim()
    .max(1000, "La nota es demasiado larga.")
    .optional()
    .or(z.literal("")),
  refundAmount: z.coerce.number().min(0).optional(),
  processRefund: z.boolean().default(false),
});

export type AdminDisputeResolveValues = z.infer<typeof adminDisputeResolveSchema>;
