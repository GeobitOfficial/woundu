import { z } from "zod";

import type { SupportTicketStatus } from "@/types/support";

const supportTicketStatuses = [
  "open",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
] as const satisfies ReadonlyArray<SupportTicketStatus>;

export const createSupportTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, "El asunto debe tener al menos 5 caracteres.")
    .max(120, "El asunto es demasiado largo."),
  message: z
    .string()
    .trim()
    .min(10, "Describe tu consulta con al menos 10 caracteres.")
    .max(4000, "El mensaje es demasiado largo."),
});

export type CreateSupportTicketValues = z.infer<typeof createSupportTicketSchema>;

export const supportTicketReplySchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, "Escribe un mensaje para continuar la conversación.")
    .max(4000, "El mensaje es demasiado largo."),
});

export type SupportTicketReplyValues = z.infer<typeof supportTicketReplySchema>;

export const adminSupportTicketStatusSchema = z.object({
  status: z.enum(supportTicketStatuses),
});

export type AdminSupportTicketStatusValues = z.infer<
  typeof adminSupportTicketStatusSchema
>;

export const adminSupportTicketReplySchema = supportTicketReplySchema;

export type AdminSupportTicketReplyValues = z.infer<
  typeof adminSupportTicketReplySchema
>;
