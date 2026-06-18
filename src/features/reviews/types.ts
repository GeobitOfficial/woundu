export type ProductReviewRecord = Readonly<{
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string | null;
  sellerId: string;
  sellerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type ProductReviewPublic = Readonly<{
  id: string;
  rating: number;
  comment: string | null;
  reviewerName: string;
  createdAt: string;
}>;

export type PendingProductReview = Readonly<{
  orderId: string;
  productId: string;
  productTitle: string;
  productSlug: string | null;
  sellerId: string;
  sellerName: string;
  completedAt: string | null;
}>;

export type OrderLineReviewState = Readonly<{
  reviewId: string | null;
  rating: number | null;
  comment: string | null;
}>;
