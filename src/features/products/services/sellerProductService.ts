import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProductCondition, ProductStatus } from "@/types";

export type SellerProductListItem = Readonly<{
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  country: string | null;
  status: ProductStatus;
  updatedAt: string;
}>;

export type SellerProductEditRecord = Readonly<{
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  country: string | null;
  city: string | null;
  categoryId: string | null;
  condition: ProductCondition;
  status: ProductStatus;
}>;

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string | number;
  compare_at_price: string | number | null;
  currency: string;
  country: string | null;
  city: string | null;
  category_id: string | null;
  condition: ProductCondition;
  status: ProductStatus;
  updated_at: string;
};

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

export async function getSellerProducts(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<ReadonlyArray<SellerProductListItem>> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, slug, price, currency, country, status, updated_at",
    )
    .eq("seller_id", sellerId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error || !data) {
    return [];
  }

  return (data as ProductRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: toNumber(row.price),
    currency: row.currency,
    country: row.country,
    status: row.status,
    updatedAt: row.updated_at,
  }));
}

export async function getSellerProductForEdit(
  supabase: SupabaseClient,
  sellerId: string,
  productId: string,
): Promise<SellerProductEditRecord | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, description, price, compare_at_price, currency, country, city, category_id, condition, status",
    )
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ProductRow;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: toNumber(row.price),
    compareAtPrice:
      row.compare_at_price != null ? toNumber(row.compare_at_price) : null,
    currency: row.currency,
    country: row.country,
    city: row.city,
    categoryId: row.category_id,
    condition: row.condition,
    status: row.status,
  };
}
