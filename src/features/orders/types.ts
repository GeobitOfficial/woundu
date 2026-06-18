import type { OrderStatus } from "@/types";
import type { OrderLineReviewState } from "@/features/reviews/types";

import type { PayoutAccountType } from "@/constants/payoutAccountTypes";

export type SellerPayoutMethod = Readonly<{
  id: string;
  userId: string;
  accountType: PayoutAccountType;
  entityName: string;
  accountNumber: string;
  accountHolder: string;
  instructions: string | null;
  isPrimary: boolean;
  sortOrder: number;
  updatedAt: string;
}>;

export type SellerPayoutProfile = Readonly<{
  userId: string;
  methods: ReadonlyArray<SellerPayoutMethod>;
  updatedAt: string | null;
}>;

export type OrderDetailLine = Readonly<{
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerId: string;
  sellerName: string;
  review: OrderLineReviewState | null;
}>;

export type OrderDetailView = Readonly<{
  id: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  currency: string;
  paymentReference: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  buyerId: string;
  buyerName: string;
  buyerCountry: string | null;
  buyerShippingCity: string | null;
  buyerShippingAddress: string | null;
  buyerPhone: string | null;
  lines: ReadonlyArray<OrderDetailLine>;
  sellerPayout: SellerPayoutProfile | null;
  viewerRole: "buyer" | "seller" | "admin";
}>;
