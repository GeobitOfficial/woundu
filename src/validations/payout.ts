import { z } from "zod";

import { PAYOUT_ACCOUNT_TYPES } from "@/constants/payoutAccountTypes";

const accountTypeValues = PAYOUT_ACCOUNT_TYPES.map((item) => item.value) as [
  "savings",
  "checking",
  "digital_wallet",
];

export const sellerPayoutMethodSchema = z.object({
  id: z.string().uuid().optional(),
  accountType: z.enum(accountTypeValues, {
    error: "Selecciona el tipo de cuenta.",
  }),
  entityName: z
    .string()
    .trim()
    .min(2, "Indica la entidad bancaria o billetera.")
    .max(120, "El nombre es demasiado largo."),
  accountNumber: z
    .string()
    .trim()
    .min(4, "Indica el número de cuenta o alias.")
    .max(120, "El número es demasiado largo."),
  accountHolder: z
    .string()
    .trim()
    .min(2, "Indica el titular de la cuenta.")
    .max(120, "El titular es demasiado largo."),
  instructions: z
    .string()
    .trim()
    .max(1000, "Las instrucciones son demasiado largas.")
    .optional()
    .or(z.literal("")),
  isPrimary: z.boolean().optional(),
});

export const sellerPayoutSettingsSchema = z.object({
  methods: z
    .array(sellerPayoutMethodSchema)
    .min(1, "Agrega al menos un método de cobro.")
    .max(10, "Puedes registrar hasta 10 métodos de cobro."),
});

export type SellerPayoutMethodFormValues = z.infer<typeof sellerPayoutMethodSchema>;
export type SellerPayoutSettingsFormValues = z.infer<
  typeof sellerPayoutSettingsSchema
>;
