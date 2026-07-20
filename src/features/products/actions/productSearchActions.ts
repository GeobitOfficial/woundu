"use server";

import { createSupabaseServerClient } from "@/services/supabase/server";
import { getProductImageUrl } from "@/utils/productDisplay";

export type SearchSuggestionItem = {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  categoryName: string | null;
  imageUrl: string | null;
};

export async function getSearchSuggestionsAction(
  query: string,
): Promise<SearchSuggestionItem[]> {
  const trimmed = query.trim().slice(0, 50);
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  // Sanitizar término para prevenir caracteres especiales de la sintaxis de Supabase
  const safeTerm = trimmed.replace(/[%(),]/g, "");

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      title,
      slug,
      price,
      currency,
      categories ( name ),
      product_images ( storage_path, is_primary, sort_order )
    `)
    .eq("status", "active")
    .is("deleted_at", null)
    .ilike("title", `%${safeTerm}%`)
    .limit(5);

  if (error || !data) {
    return [];
  }

  return data.map((row: any) => {
    const categoryName = Array.isArray(row.categories)
      ? row.categories[0]?.name ?? null
      : row.categories?.name ?? null;

    const images = Array.isArray(row.product_images) ? row.product_images : [];
    const primaryImg =
      images.find((img: any) => img.is_primary) || images[0] || null;
    const imageUrl = primaryImg?.storage_path
      ? getProductImageUrl(primaryImg.storage_path)
      : null;

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      price: Number(row.price),
      currency: row.currency,
      categoryName,
      imageUrl,
    };
  });
}
