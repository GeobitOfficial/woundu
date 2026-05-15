import type { OrderStatus, UserRole } from "@/types";

export type AccountProfileView = Readonly<{
  id: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  reputationScore: number;
  reviewsCount: number;
}>;

export type BuyerOrderItemView = Readonly<{
  id: string;
  productTitle: string;
  productSlug: string | null;
  quantity: number;
  totalPrice: number;
}>;

export type BuyerOrderView = Readonly<{
  id: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  items: ReadonlyArray<BuyerOrderItemView>;
}>;

export type SellerOrderLineView = Readonly<{
  id: string;
  orderId: string;
  orderStatus: OrderStatus;
  productTitle: string;
  productSlug: string | null;
  quantity: number;
  lineTotal: number;
  currency: string;
  orderCreatedAt: string;
}>;

export type SellerProductStatsView = {
  active: number;
  draft: number;
  paused: number;
  sold: number;
  archived: number;
};

export type SellerSalesTotalsView = {
  completedAmount: number;
  inProgressAmount: number;
  cancelledOrRefundedAmount: number;
  currency: string;
};

export type AccountFavoriteProductView = Readonly<{
  productId: string;
  title: string;
  slug: string | null;
  price: number;
  currency: string;
  favoritedAt: string;
}>;

export type AccountDashboardSnapshot = Readonly<{
  profile: AccountProfileView | null;
  buyerOrders: ReadonlyArray<BuyerOrderView>;
  sellerLines: ReadonlyArray<SellerOrderLineView>;
  productStats: SellerProductStatsView;
  sellerSalesTotals: SellerSalesTotalsView;
  favoriteProducts: ReadonlyArray<AccountFavoriteProductView>;
}>;
