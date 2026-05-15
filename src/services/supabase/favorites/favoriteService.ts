import type { SupabaseClient } from "@supabase/supabase-js";

export async function getFavoriteProductIds(
  supabase: SupabaseClient,
  userId: string,
  productIds: ReadonlyArray<string>,
): Promise<ReadonlySet<string>> {
  if (productIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId)
    .in("product_id", [...productIds]);

  if (error || !data) {
    return new Set();
  }

  return new Set(
    (data as ReadonlyArray<{ product_id: string }>).map((row) => row.product_id),
  );
}
