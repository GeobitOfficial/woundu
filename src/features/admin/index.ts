export type {
  AdminDashboardStats,
  AdminOrderLineRecord,
  AdminOrderRecord,
  AdminProductRecord,
  AdminUserRecord,
} from "./types";
export type { AdminSupportTicketRecord, SupportTicketDetail } from "@/types/support";

export {
  getAdminDashboardStats,
  getAllOrdersForAdmin,
  getAllProductsForAdmin,
  getAllSupportTicketsForAdmin,
  getAllUsersForAdmin,
  getSupportTicketDetailForAdmin,
} from "./services/adminReadService";

export {
  setUserBanAsAdmin,
  updateOrderStatusAsAdmin,
  updateProductAsAdmin,
} from "./services/adminMutations";

export {
  loadSupportTicketDetailAsAdmin,
  replyToSupportTicketAsAdmin,
  updateSupportTicketStatusAsAdmin,
} from "./services/adminTicketMutations";
