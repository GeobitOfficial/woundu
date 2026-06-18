import type { SupabaseClient } from "@supabase/supabase-js";

import { ACCOUNT_FAVORITES_PAGE_SIZE } from "@/features/account/favoriteConstants";
import type { AccountFavoriteProductView } from "@/features/account/types";

type FavoriteProductEmbed = {
  id: string;
  title: string;
  slug: string;
  price: string | number;
  currency: string;
  status: string;
  deleted_at: string | null;
} | null;

type FavoriteRow = {
  created_at: string;
  products: FavoriteProductEmbed | FavoriteProductEmbed[] | null;
};

const FAVORITE_PRODUCT_SELECT = `
  created_at,
  products!inner (
    id,
    title,
    slug,
    price,
    currency,
    status,
    deleted_at
  )
`;

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (relation == null) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

export function mapFavoriteRows(
  rows: ReadonlyArray<FavoriteRow>,
): AccountFavoriteProductView[] {
  const items: AccountFavoriteProductView[] = [];

  for (const row of rows) {
    const product = firstRelation(row.products);

    if (!product || product.deleted_at != null) {
      continue;
    }

    items.push({
      productId: product.id,
      title: product.title,
      slug: product.slug ?? null,
      price: toNumber(product.price),
      currency: product.currency,
      favoritedAt: row.created_at,
    });
  }

  return items;
}

export type FavoriteProductsPage = Readonly<{
  items: ReadonlyArray<AccountFavoriteProductView>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

export async function getFavoriteProductsPaginated(
  supabase: SupabaseClient,
  userId: string,
  page: number,
  pageSize: number = ACCOUNT_FAVORITES_PAGE_SIZE,
): Promise<FavoriteProductsPage> {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { count, data, error } = await supabase
    .from("favorites")
    .select(FAVORITE_PRODUCT_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .is("products.deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return {
      items: [],
      page: safePage,
      pageSize,
      total: 0,
      totalPages: 0,
    };
  }

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items: mapFavoriteRows(data as FavoriteRow[]),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}
