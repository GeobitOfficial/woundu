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
  createdAt: string;
  updatedAt: string;
}>;

export type AdminUserRecord = Readonly<{
  id: string;
  fullName: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  reputationScore: number;
  reviewsCount: number;
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  buyerId: string;
  buyerName: string;
  buyerEmail: string | null;
  lines: ReadonlyArray<AdminOrderLineRecord>;
}>;

export type AdminDashboardStats = Readonly<{
  totalProducts: number;
  pendingProducts: number;
  activeProducts: number;
  rejectedProducts: number;
  totalUsers: number;
  bannedUsers: number;
  totalOrders: number;
  completedOrders: number;
  openSupportTickets: number;
  totalSupportTickets: number;
}>;
