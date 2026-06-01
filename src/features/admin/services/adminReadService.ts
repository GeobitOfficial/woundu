import {
  getOpenSupportTicketCountForAdmin,
  getAllSupportTicketsForAdmin,
  getSupportTicketDetailForAdmin,
} from "./adminTicketReadService";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { ProductCondition, ProductStatus, UserRole } from "@/types";

import type {
  AdminDashboardStats,
  AdminOrderRecord,
  AdminProductRecord,
  AdminUserRecord,
} from "../types";
import {
  ADMIN_ORDER_SELECT,
  mapAdminOrder,
  type OrderAdminRow,
} from "./adminOrderMapper";

const ADMIN_PRODUCT_SELECT = `
  id,
  seller_id,
  category_id,
  title,
  slug,
  description,
  price,
  currency,
  condition,
  status,
  city,
  country,
  moderation_note,
  reviewed_at,
  created_at,
  updated_at,
  deleted_at,
  categories ( name ),
  profiles!products_seller_id_fkey ( full_name, email )
`;

type ProductAdminRow = {
  id: string;
  seller_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  price: string | number;
  currency: string;
  condition: ProductCondition;
  status: ProductStatus;
  city: string | null;
  country: string | null;
  moderation_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories: { name: string } | { name: string }[] | null;
  profiles:
    | { full_name: string; email: string | null }
    | { full_name: string; email: string | null }[]
    | null;
};

type ProfileAdminRow = {
  id: string;
  full_name: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  reputation_score: string | number;
  reviews_count: number;
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapAdminProduct(row: ProductAdminRow): AdminProductRecord {
  const seller = firstRelation(row.profiles);
  const category = firstRelation(row.categories);

  return {
    id: row.id,
    sellerId: row.seller_id,
    sellerName: seller?.full_name ?? "Vendedor",
    sellerEmail: seller?.email ?? null,
    categoryId: row.category_id,
    categoryName: category?.name ?? null,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    status: row.status,
    city: row.city,
    country: row.country,
    moderationNote: row.moderation_note,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdminUser(row: ProfileAdminRow): AdminUserRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    username: row.username,
    role: row.role,
    reputationScore: Number(row.reputation_score),
    reviewsCount: row.reviews_count,
    isBanned: row.is_banned,
    bannedAt: row.banned_at,
    banReason: row.ban_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllProductsForAdmin(): Promise<AdminProductRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as ProductAdminRow[]).map(mapAdminProduct);
}

export async function getAllUsersForAdmin(): Promise<AdminUserRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, username, role, reputation_score, reviews_count, is_banned, banned_at, ban_reason, created_at, updated_at, deleted_at",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ProfileAdminRow[]).map(mapAdminUser);
}

export async function getAllOrdersForAdmin(): Promise<AdminOrderRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select(ADMIN_ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as OrderAdminRow[]).map(mapAdminOrder);
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [products, users, orders, openSupportTickets, supportTickets] =
    await Promise.all([
      getAllProductsForAdmin(),
      getAllUsersForAdmin(),
      getAllOrdersForAdmin(),
      getOpenSupportTicketCountForAdmin(),
      getAllSupportTicketsForAdmin(),
    ]);

  return {
    totalProducts: products.length,
    pendingProducts: products.filter((item) => item.status === "pending_review")
      .length,
    activeProducts: products.filter((item) => item.status === "active").length,
    rejectedProducts: products.filter((item) => item.status === "rejected")
      .length,
    totalUsers: users.length,
    bannedUsers: users.filter((item) => item.isBanned).length,
    totalOrders: orders.length,
    completedOrders: orders.filter((item) => item.status === "completed").length,
    openSupportTickets,
    totalSupportTickets: supportTickets.length,
  };
}

export {
  getAllSupportTicketsForAdmin,
  getSupportTicketDetailForAdmin,
} from "./adminTicketReadService";
