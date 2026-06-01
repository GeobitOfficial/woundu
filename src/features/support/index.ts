export type {
  AdminSupportTicketRecord,
  SupportTicketDetail,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketSummary,
  UserSupportTicketSummary,
} from "@/types/support";

export {
  createSupportTicket,
  loadUserSupportTicketDetail,
  replyToSupportTicketAsUser,
} from "./services/supportTicketMutations";

export {
  getUserSupportTicketDetail,
  getUserSupportTickets,
} from "./services/supportTicketReadService";
