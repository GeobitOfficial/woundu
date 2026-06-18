import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountDashboardSnapshot } from "@/features/account/types";
import type { OrderStatus, ProductStatus, UserRole } from "@/types";
import { mapFavoriteRows } from "@/services/supabase/account/favoriteAccountService";
import {
  mapBuyerOrderRows,
  type BuyerOrderRow,
} from "@/services/supabase/account/buyerOrdersAccountService";
import {
  mapSellerOrderRows,
  type SellerOrderItemRow,
} from "@/services/supabase/account/sellerSalesAccountService";

type ProfileRow = {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  reputation_score: string | number;
  reviews_count: number;
  country: string | null;
  currency: string;
  shipping_city: string | null;
  shipping_address: string | null;
  phone: string | null;
  whatsapp: string | null;
  deleted_at: string | null;
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
    country: row.country?.trim() ? row.country.trim() : null,
    currency: row.currency?.trim() ? row.currency.trim() : "USD",
    shippingCity: row.shipping_city?.trim() ? row.shipping_city.trim() : null,
    shippingAddress: row.shipping_address?.trim()
      ? row.shipping_address.trim()
      : null,
    phone: row.phone?.trim() ? row.phone.trim() : null,
    whatsapp: row.whatsapp?.trim() ? row.whatsapp.trim() : null,
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
        "id, full_name, username, avatar_url, bio, role, reputation_score, reviews_count, country, currency, shipping_city, shipping_address, phone, whatsapp, deleted_at",
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
        unit_price,
        total_price,
        orders (
          id,
          status,
          total,
          currency,
          created_at,
          buyer_id,
          payment_reference,
          profiles!orders_buyer_id_fkey (
            full_name,
            country,
            shipping_city,
            shipping_address,
            phone
          )
        ),
        products (
          title,
          slug,
          product_images ( storage_path, sort_order, is_primary )
        )
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
      ? mapBuyerOrderRows(ordersResult.data as BuyerOrderRow[])
      : [];

  const sellerLines: AccountDashboardSnapshot["sellerLines"] =
    !sellerItemsResult.error && sellerItemsResult.data
      ? mapSellerOrderRows(sellerItemsResult.data as SellerOrderItemRow[])
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
      ? mapFavoriteRows(favoritesResult.data as FavoriteRow[])
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
