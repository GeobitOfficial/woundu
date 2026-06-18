import { z } from "zod";

export const buyerPaymentReportSchema = z.object({
  paymentReference: z
    .string()
    .trim()
    .min(3, "Indica una referencia o comprobante (mín. 3 caracteres).")
    .max(120, "La referencia es demasiado larga."),
});

export type BuyerPaymentReportValues = z.infer<typeof buyerPaymentReportSchema>;

export const buyerCancelOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(240, "El motivo es demasiado largo.")
    .optional()
    .or(z.literal("")),
});

export type BuyerCancelOrderValues = z.infer<typeof buyerCancelOrderSchema>;

export const sellerOrderActionSchema = z.object({
  note: z
    .string()
    .trim()
    .max(240, "La nota es demasiado larga.")
    .optional()
    .or(z.literal("")),
});

export type SellerOrderActionValues = z.infer<typeof sellerOrderActionSchema>;
