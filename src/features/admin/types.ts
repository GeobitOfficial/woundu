import type { OrderStatus, ProductCondition, ProductStatus, UserRole } from "@/types";

export type AdminProductRecord = Readonly<{
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string | null;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  status: ProductStatus;
  city: string | null;
  country: string | null;
  moderationNote: string | null;
  reviewedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type AdminDeletedProductRecord = AdminProductRecord &
  Readonly<{
    deletedAt: string;
  }>;

export type AdminUserRecord = Readonly<{
  id: string;
  fullName: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  country: string | null;
  currency: string | null;
  reputationScore: number;
  reviewsCount: number;
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type AdminReviewRecord = Readonly<{
  id: string;
  productId: string;
  productTitle: string;
  reviewerId: string;
  reviewerName: string;
  sellerId: string;
  sellerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}>;

export type AdminCountryCurrencyRecord = Readonly<{
  country: string;
  currency: string;
}>;

export type AdminOrderLineRecord = Readonly<{
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productCity: string | null;
  productCountry: string | null;
  sellerId: string;
  sellerName: string;
  sellerEmail: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}>;

export type AdminOrderRecord = Readonly<{
  id: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  currency: string;
  paymentReference: string | null;
  refundedAt: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  buyerId: string;
  buyerName: string;
  buyerEmail: string | null;
  lines: ReadonlyArray<AdminOrderLineRecord>;
}>;

export type OrderDisputeStatus =
  | "open"
  | "under_review"
  | "approved_refund"
  | "rejected"
  | "closed";

export type AdminDisputeRecord = Readonly<{
  id: string;
  orderId: string;
  orderStatus: OrderStatus;
  orderTotal: number;
  orderCurrency: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string | null;
  openedById: string;
  openedByName: string;
  status: OrderDisputeStatus;
  reason: string;
  buyerNote: string | null;
  adminNote: string | null;
  refundAmount: number | null;
  resolvedAt: string | null;
  resolvedByName: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type AdminAuditLogRecord = Readonly<{
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}>;

export type AdminPaymentWorkflow = "confirm_payment" | "manage_dispute" | "process_refund";

export type AdminDashboardStats = Readonly<{
  totalProducts: number;
  pendingProducts: number;
  activeProducts: number;
  rejectedProducts: number;
  totalUsers: number;
  buyerUsers: number;
  sellerUsers: number;
  bannedUsers: number;
  totalOrders: number;
  completedOrders: number;
  openSupportTickets: number;
  totalSupportTickets: number;
}>;
