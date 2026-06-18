export type {
  AdminAuditLogRecord,
  AdminCountryCurrencyRecord,
  AdminDashboardStats,
  AdminDeletedProductRecord,
  AdminDisputeRecord,
  AdminOrderLineRecord,
  AdminOrderRecord,
  AdminProductRecord,
  AdminReviewRecord,
  AdminUserRecord,
  OrderDisputeStatus,
} from "./types";
export type { AdminSupportTicketRecord, SupportTicketDetail } from "@/types/support";

export {
  getAdminAuditLogs,
  getAdminDashboardStats,
  getAllCountryCurrenciesForAdmin,
  getAllDisputesForAdmin,
  getAllOrdersForAdmin,
  getAllProductsForAdmin,
  getAllReviewsForAdmin,
  getAllSupportTicketsForAdmin,
  getAllUsersForAdmin,
  getDeletedProductsForAdmin,
  getSupportTicketDetailForAdmin,
} from "./services/adminReadService";

export {
  deleteReviewAsAdmin,
  restoreProductAsAdmin,
  setProductModerationAsAdmin,
  setUserBanAsAdmin,
  setUserLocaleAsAdmin,
  setUserRoleAsAdmin,
  updateCountryCurrencyAsAdmin,
  updateOrderStatusAsAdmin,
  updateProductAsAdmin,
} from "./services/adminMutations";

export {
  confirmOrderPaymentAsAdmin,
  createOrderDisputeAsAdmin,
  processOrderRefundAsAdmin,
  resolveOrderDisputeAsAdmin,
} from "./services/adminPaymentMutations";

export { logAdminAction } from "./services/adminAuditMutations";

export {
  loadSupportTicketDetailAsAdmin,
  replyToSupportTicketAsAdmin,
  updateSupportTicketStatusAsAdmin,
} from "./services/adminTicketMutations";
