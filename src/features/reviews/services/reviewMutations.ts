import { getCurrentUser, supabase } from "@/services/supabase/client";
import type { ProductReviewRecord } from "@/features/reviews/types";
import type { ProductReviewFormValues } from "@/validations/review";

type ReviewRow = {
  id: string;
  product_id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

function mapReview(row: ReviewRow): ProductReviewRecord {
  return {
    id: row.id,
    productId: row.product_id,
    productTitle: "",
    productSlug: null,
    sellerId: row.seller_id,
    sellerName: "",
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createProductReview(
  values: ProductReviewFormValues,
): Promise<{ data: ProductReviewRecord | null; error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();
  if (userError || !userData.user) {
    return { data: null, error: "Debes iniciar sesión." };
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: values.productId,
      seller_id: values.sellerId,
      reviewer_id: userData.user.id,
      rating: values.rating,
      comment: values.comment,
    })
    .select("id, product_id, seller_id, rating, comment, created_at, updated_at")
    .single();

  if (error || !data) {
    const message = error?.message?.toLowerCase() ?? "";
    if (message.includes("duplicate") || message.includes("unique")) {
      return { data: null, error: "Ya dejaste una reseña para este producto." };
    }
    if (message.includes("row-level security")) {
      return {
        data: null,
        error: "Solo puedes reseñar productos que compraste y recibiste.",
      };
    }
    return { data: null, error: "No pudimos publicar tu reseña." };
  }

  return { data: mapReview(data as ReviewRow), error: null };
}

export async function updateProductReview(
  reviewId: string,
  values: Pick<ProductReviewFormValues, "rating" | "comment">,
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();
  if (userError || !userData.user) {
    return { error: "Debes iniciar sesión." };
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      rating: values.rating,
      comment: values.comment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .eq("reviewer_id", userData.user.id);

  if (error) {
    return { error: "No pudimos actualizar tu reseña." };
  }

  return { error: null };
}
