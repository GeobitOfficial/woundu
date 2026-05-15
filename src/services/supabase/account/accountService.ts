import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountDashboardSnapshot } from "@/features/account/types";
import type { OrderStatus, ProductStatus, UserRole } from "@/types";

type ProfileRow = {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  reputation_score: string | number;
  reviews_count: number;
  deleted_at: string | null;
};

type ProductEmbed = {
  title: string;
  slug: string;
} | null;

type OrderItemRow = {
  id: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  product_id: string;
  products: ProductEmbed | ProductEmbed[] | null;
};

type OrderRow = {
  id: string;
  status: OrderStatus;
  subtotal: string | number;
  total: string | number;
  currency: string;
  created_at: string;
  order_items: OrderItemRow[] | null;
};

type OrderEmbed = {
  id: string;
  status: OrderStatus;
  total: string | number;
  currency: string;
  created_at: string;
} | null;

type SellerOrderItemRow = {
  id: string;
  order_id: string;
  quantity: number;
  total_price: string | number;
  orders: OrderEmbed | OrderEmbed[] | null;
  products: ProductEmbed | ProductEmbed[] | null;
};

type ProductStatusRow = {
  status: ProductStatus;
};

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

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (relation == null) {
    return null;
  }
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

function mapProfile(row: ProfileRow): AccountDashboardSnapshot["profile"] {
  if (row.deleted_at) {
    return null;
  }
  return {
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    role: row.role,
    reputationScore: Number(row.reputation_score),
    reviewsCount: row.reviews_count,
  };
}

export async function getAccountDashboard(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountDashboardSnapshot> {
  const [
    profileResult,
    ordersResult,
    sellerItemsResult,
    productsResult,
    favoritesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, username, avatar_url, bio, role, reputation_score, reviews_count, deleted_at",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("orders")
      .select(
        `
        id,
        status,
        subtotal,
        total,
        currency,
        created_at,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          product_id,
          products ( title, slug )
        )
      `,
      )
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("order_items")
      .select(
        `
        id,
        order_id,
        quantity,
        total_price,
        orders ( id, status, total, currency, created_at ),
        products ( title, slug )
      `,
      )
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("products")
      .select("status")
      .eq("seller_id", userId)
      .is("deleted_at", null),
    supabase
      .from("favorites")
      .select(
        `
        created_at,
        products (
          id,
          title,
          slug,
          price,
          currency,
          status,
          deleted_at
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  const profile =
    profileResult.data && !profileResult.error
      ? mapProfile(profileResult.data as ProfileRow)
      : null;

  const buyerOrders: AccountDashboardSnapshot["buyerOrders"] =
    !ordersResult.error && ordersResult.data
      ? (ordersResult.data as OrderRow[]).map((row) => ({
          id: row.id,
          status: row.status,
          total: toNumber(row.total),
          currency: row.currency,
          createdAt: row.created_at,
          items: (row.order_items ?? []).map((item) => {
            const product = firstRelation(item.products);
            return {
              id: item.id,
              productTitle: product?.title ?? "Producto",
              productSlug: product?.slug ?? null,
              quantity: item.quantity,
              totalPrice: toNumber(item.total_price),
            };
          }),
        }))
      : [];

  const sellerLines: AccountDashboardSnapshot["sellerLines"] =
    !sellerItemsResult.error && sellerItemsResult.data
      ? (sellerItemsResult.data as SellerOrderItemRow[]).map((row) => {
          const order = firstRelation(row.orders);
          const product = firstRelation(row.products);
          return {
            id: row.id,
            orderId: row.order_id,
            orderStatus: order?.status ?? "pending",
            productTitle: product?.title ?? "Producto",
            productSlug: product?.slug ?? null,
            quantity: row.quantity,
            lineTotal: toNumber(row.total_price),
            currency: order?.currency ?? "USD",
            orderCreatedAt: order?.created_at ?? "",
          };
        })
      : [];

  const productStats: AccountDashboardSnapshot["productStats"] = {
    active: 0,
    draft: 0,
    paused: 0,
    sold: 0,
    archived: 0,
  };

  if (!productsResult.error && productsResult.data) {
    for (const row of productsResult.data as ProductStatusRow[]) {
      if (row.status === "active") {
        productStats.active += 1;
      } else if (row.status === "draft") {
        productStats.draft += 1;
      } else if (row.status === "paused") {
        productStats.paused += 1;
      } else if (row.status === "sold") {
        productStats.sold += 1;
      } else if (row.status === "archived") {
        productStats.archived += 1;
      }
    }
  }

  let completedAmount = 0;
  let inProgressAmount = 0;
  let cancelledOrRefundedAmount = 0;
  let currency = "USD";

  for (const line of sellerLines) {
    currency = line.currency || currency;
    if (line.orderStatus === "completed") {
      completedAmount += line.lineTotal;
    } else if (
      line.orderStatus === "pending" ||
      line.orderStatus === "paid" ||
      line.orderStatus === "processing"
    ) {
      inProgressAmount += line.lineTotal;
    } else if (
      line.orderStatus === "cancelled" ||
      line.orderStatus === "refunded"
    ) {
      cancelledOrRefundedAmount += line.lineTotal;
    }
  }

  const sellerSalesTotals: AccountDashboardSnapshot["sellerSalesTotals"] = {
    completedAmount,
    inProgressAmount,
    cancelledOrRefundedAmount,
    currency,
  };

  const favoriteProducts: AccountDashboardSnapshot["favoriteProducts"] =
    !favoritesResult.error && favoritesResult.data
      ? (favoritesResult.data as FavoriteRow[])
          .map((row) => {
            const product = firstRelation(row.products);
            if (!product || product.deleted_at != null) {
              return null;
            }
            return {
              productId: product.id,
              title: product.title,
              slug: product.slug,
              price: toNumber(product.price),
              currency: product.currency,
              favoritedAt: row.created_at,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item != null)
      : [];

  return {
    profile,
    buyerOrders,
    sellerLines,
    productStats,
    sellerSalesTotals,
    favoriteProducts,
  };
}
