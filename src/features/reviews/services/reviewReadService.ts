import { createSupabaseServerClient } from "@/services/supabase/server";
import type {
  OrderLineReviewState,
  PendingProductReview,
  ProductReviewPublic,
  ProductReviewRecord,
} from "@/features/reviews/types";

type ReviewRow = {
  id: string;
  product_id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  products:
    | { title: string; slug: string }
    | ReadonlyArray<{ title: string; slug: string }>
    | null;
  profiles:
    | { full_name: string }
    | ReadonlyArray<{ full_name: string }>
    | null;
};

type OrderItemEmbed = {
  product_id: string;
  seller_id: string;
  products:
    | { title: string; slug: string }
    | ReadonlyArray<{ title: string; slug: string }>
    | null;
  profiles:
    | { full_name: string }
    | ReadonlyArray<{ full_name: string }>
    | null;
};

type CompletedOrderRow = {
  id: string;
  completed_at: string | null;
  order_items: OrderItemEmbed[] | null;
};

function firstRelation<T>(
  value: T | readonly T[] | null | undefined,
): T | null {
  if (value == null) {
    return null;
  }

  if (Array.isArray(value)) {
    return (value[0] as T | undefined) ?? null;
  }

  return value as T;
}

function mapReview(row: ReviewRow): ProductReviewRecord {
  const product = firstRelation(row.products);
  const seller = firstRelation(row.profiles);

  return {
    id: row.id,
    productId: row.product_id,
    productTitle: product?.title ?? "Producto",
    productSlug: product?.slug ?? null,
    sellerId: row.seller_id,
    sellerName: seller?.full_name ?? "Vendedor",
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPendingReviewsForBuyer(
  userId: string,
): Promise<ReadonlyArray<PendingProductReview>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const [{ data: orders, error }, { data: existingReviews }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        `
        id,
        completed_at,
        order_items (
          product_id,
          seller_id,
          products ( title, slug ),
          profiles!order_items_seller_id_fkey ( full_name )
        )
      `,
      )
      .eq("buyer_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(40),
    supabase.from("reviews").select("product_id").eq("reviewer_id", userId),
  ]);

  if (error || !orders) {
    return [];
  }

  const reviewedProductIds = new Set(
    ((existingReviews ?? []) as ReadonlyArray<{ product_id: string }>).map(
      (row) => row.product_id,
    ),
  );

  const pendingByProduct = new Map<string, PendingProductReview>();

  for (const order of orders as unknown as CompletedOrderRow[]) {
    for (const item of order.order_items ?? []) {
      if (reviewedProductIds.has(item.product_id)) {
        continue;
      }

      if (pendingByProduct.has(item.product_id)) {
        continue;
      }

      const product = firstRelation(item.products);
      const seller = firstRelation(item.profiles);

      pendingByProduct.set(item.product_id, {
        orderId: order.id,
        productId: item.product_id,
        productTitle: product?.title ?? "Producto",
        productSlug: product?.slug ?? null,
        sellerId: item.seller_id,
        sellerName: seller?.full_name ?? "Vendedor",
        completedAt: order.completed_at,
      });
    }
  }

  return [...pendingByProduct.values()];
}

export async function getReviewsByProductIdsForBuyer(
  userId: string,
  productIds: ReadonlyArray<string>,
): Promise<Map<string, OrderLineReviewState>> {
  const result = new Map<string, OrderLineReviewState>();

  if (productIds.length === 0) {
    return result;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return result;
  }

  const { data } = await supabase
    .from("reviews")
    .select("id, product_id, rating, comment")
    .eq("reviewer_id", userId)
    .in("product_id", [...productIds]);

  for (const row of (data ?? []) as ReadonlyArray<{
    id: string;
    product_id: string;
    rating: number;
    comment: string | null;
  }>) {
    result.set(row.product_id, {
      reviewId: row.id,
      rating: row.rating,
      comment: row.comment,
    });
  }

  return result;
}

export async function getOwnReviewsForBuyer(
  userId: string,
): Promise<ReadonlyArray<ProductReviewRecord>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      product_id,
      seller_id,
      rating,
      comment,
      created_at,
      updated_at,
      products ( title, slug ),
      profiles!reviews_seller_id_fkey ( full_name )
    `,
    )
    .eq("reviewer_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return (data as unknown as ReviewRow[]).map(mapReview);
}

type ProductReviewPublicRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles:
    | { full_name: string }
    | ReadonlyArray<{ full_name: string }>
    | null;
};

export async function getProductReviewsForProduct(
  productId: string,
): Promise<ReadonlyArray<ProductReviewPublic>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      profiles!reviews_reviewer_id_fkey ( full_name )
    `,
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return (data as unknown as ProductReviewPublicRow[]).map((row) => {
    const reviewer = firstRelation(row.profiles);

    return {
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      reviewerName: reviewer?.full_name ?? "Comprador",
      createdAt: row.created_at,
    };
  });
}
