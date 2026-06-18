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
  stock: number;
  updatedAt: string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryIcon: string | null;
  primaryImagePath: string | null;
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
  stock: number;
  shippingType: "free" | "paid";
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
  stock: number;
  shipping_type?: "free" | "paid";
  updated_at: string;
  categories:
    | {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
      }
    | {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
      }[]
    | null;
  product_images:
    | ReadonlyArray<{
        storage_path: string;
        sort_order: number;
        is_primary: boolean;
      }>
    | null;
};

const SELLER_PRODUCTS_SELECT = `
  id,
  title,
  slug,
  price,
  currency,
  country,
  status,
  stock,
  updated_at,
  category_id,
  categories (
    id,
    name,
    slug,
    icon
  ),
  product_images (
    storage_path,
    sort_order,
    is_primary
  )
`;

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

function getFirstRelation<Relation>(relation: Relation | Relation[] | null) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function pickPrimaryImagePath(
  images: ProductRow["product_images"],
): string | null {
  if (!images?.length) {
    return null;
  }

  const sorted = [...images].sort((first, second) => {
    if (first.is_primary && !second.is_primary) {
      return -1;
    }

    if (!first.is_primary && second.is_primary) {
      return 1;
    }

    return first.sort_order - second.sort_order;
  });

  return sorted[0]?.storage_path ?? null;
}

function mapSellerProductRow(row: ProductRow): SellerProductListItem {
  const category = getFirstRelation(row.categories);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: toNumber(row.price),
    currency: row.currency,
    country: row.country,
    status: row.status,
    stock: Number(row.stock ?? 0),
    updatedAt: row.updated_at,
    categoryId: row.category_id,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    categoryIcon: category?.icon ?? null,
    primaryImagePath: pickPrimaryImagePath(row.product_images),
  };
}

export async function getSellerProducts(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<ReadonlyArray<SellerProductListItem>> {
  const { data, error } = await supabase
    .from("products")
    .select(SELLER_PRODUCTS_SELECT)
    .eq("seller_id", sellerId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return (data as ProductRow[]).map(mapSellerProductRow);
}

export async function getSellerProductForEdit(
  supabase: SupabaseClient,
  sellerId: string,
  productId: string,
): Promise<SellerProductEditRecord | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, description, price, compare_at_price, currency, country, city, category_id, condition, status, stock, shipping_type",
    )
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as Omit<ProductRow, "categories" | "product_images" | "slug" | "updated_at">;

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
    stock: Number(row.stock ?? 0),
    shippingType: row.shipping_type ?? "free",
  };
}
