import {
  getOpenSupportTicketCountForAdmin,
  getAllSupportTicketsForAdmin,
  getSupportTicketDetailForAdmin,
} from "./adminTicketReadService";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { ProductCondition, ProductStatus, UserRole } from "@/types";

import type {
  AdminAuditLogRecord,
  AdminCountryCurrencyRecord,
  AdminDashboardStats,
  AdminDeletedProductRecord,
  AdminDisputeRecord,
  AdminOrderRecord,
  AdminProductRecord,
  AdminReviewRecord,
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
  country: string | null;
  currency: string | null;
  reputation_score: string | number;
  reviews_count: number;
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ReviewAdminRow = {
  id: string;
  product_id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  products: { title: string } | { title: string }[] | null;
  reviewer:
    | { full_name: string }
    | { full_name: string }[]
    | null;
  seller:
    | { full_name: string }
    | { full_name: string }[]
    | null;
};

type CountryCurrencyRow = {
  country: string;
  currency: string;
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
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdminDeletedProduct(row: ProductAdminRow): AdminDeletedProductRecord {
  const product = mapAdminProduct(row);
  return {
    ...product,
    deletedAt: row.deleted_at ?? product.updatedAt,
  };
}

function mapAdminUser(row: ProfileAdminRow): AdminUserRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    username: row.username,
    role: row.role,
    country: row.country,
    currency: row.currency,
    reputationScore: Number(row.reputation_score),
    reviewsCount: row.reviews_count,
    isBanned: row.is_banned,
    bannedAt: row.banned_at,
    banReason: row.ban_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdminReview(row: ReviewAdminRow): AdminReviewRecord {
  const product = firstRelation(row.products);
  const reviewer = firstRelation(row.reviewer);
  const seller = firstRelation(row.seller);

  return {
    id: row.id,
    productId: row.product_id,
    productTitle: product?.title ?? "Producto",
    reviewerId: row.reviewer_id,
    reviewerName: reviewer?.full_name ?? "Usuario",
    sellerId: row.seller_id,
    sellerName: seller?.full_name ?? "Vendedor",
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
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

export async function getDeletedProductsForAdmin(): Promise<
  AdminDeletedProductRecord[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as ProductAdminRow[]).map(mapAdminDeletedProduct);
}

type DisputeReadRow = {
  id: string;
  order_id: string;
  opened_by: string;
  status: AdminDisputeRecord["status"];
  reason: string;
  buyer_note: string | null;
  admin_note: string | null;
  refund_amount: string | number | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  orders:
    | {
        buyer_id: string;
        status: AdminOrderRecord["status"];
        total: string | number;
        currency: string;
        profiles:
          | { full_name: string; email: string | null }
          | { full_name: string; email: string | null }[]
          | null;
      }
    | {
        buyer_id: string;
        status: AdminOrderRecord["status"];
        total: string | number;
        currency: string;
        profiles:
          | { full_name: string; email: string | null }
          | { full_name: string; email: string | null }[]
          | null;
      }[]
    | null;
  opener: { full_name: string } | { full_name: string }[] | null;
  resolver: { full_name: string } | { full_name: string }[] | null;
};

function mapAdminDisputeRow(row: DisputeReadRow): AdminDisputeRecord {
  const order = firstRelation(row.orders);
  const buyer = firstRelation(order?.profiles ?? null);
  const opener = firstRelation(row.opener);
  const resolver = firstRelation(row.resolver);

  return {
    id: row.id,
    orderId: row.order_id,
    orderStatus: order?.status ?? "pending",
    orderTotal: Number(order?.total ?? 0),
    orderCurrency: order?.currency ?? "USD",
    buyerId: order?.buyer_id ?? row.opened_by,
    buyerName: buyer?.full_name ?? "Comprador",
    buyerEmail: buyer?.email ?? null,
    openedById: row.opened_by,
    openedByName: opener?.full_name ?? "Usuario",
    status: row.status,
    reason: row.reason,
    buyerNote: row.buyer_note,
    adminNote: row.admin_note,
    refundAmount: row.refund_amount != null ? Number(row.refund_amount) : null,
    resolvedAt: row.resolved_at,
    resolvedByName: resolver?.full_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllDisputesForAdmin(): Promise<AdminDisputeRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("order_disputes")
    .select(
      `
      id,
      order_id,
      opened_by,
      status,
      reason,
      buyer_note,
      admin_note,
      refund_amount,
      resolved_at,
      resolved_by,
      created_at,
      updated_at,
      orders (
        buyer_id,
        status,
        total,
        currency,
        profiles!orders_buyer_id_fkey ( full_name, email )
      ),
      opener:profiles!order_disputes_opened_by_fkey ( full_name ),
      resolver:profiles!order_disputes_resolved_by_fkey ( full_name )
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as DisputeReadRow[]).map(mapAdminDisputeRow);
}

type AuditLogRow = {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

export async function getAdminAuditLogs(
  limit = 150,
): Promise<AdminAuditLogRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select(
      `
      id,
      actor_id,
      action,
      entity_type,
      entity_id,
      summary,
      metadata,
      created_at,
      profiles!admin_audit_logs_actor_id_fkey ( full_name )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as unknown as AuditLogRow[]).map((row) => {
    const actor = firstRelation(row.profiles);
    return {
      id: row.id,
      actorId: row.actor_id,
      actorName: actor?.full_name ?? "Super Admin",
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      summary: row.summary,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
    };
  });
}

export async function getAllUsersForAdmin(): Promise<AdminUserRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, username, role, country, currency, reputation_score, reviews_count, is_banned, banned_at, ban_reason, created_at, updated_at, deleted_at",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ProfileAdminRow[]).map(mapAdminUser);
}

export async function getAllReviewsForAdmin(): Promise<AdminReviewRecord[]> {
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
      reviewer_id,
      seller_id,
      rating,
      comment,
      created_at,
      products ( title ),
      reviewer:profiles!reviews_reviewer_id_fkey ( full_name ),
      seller:profiles!reviews_seller_id_fkey ( full_name )
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as ReviewAdminRow[]).map(mapAdminReview);
}

export async function getAllCountryCurrenciesForAdmin(): Promise<
  AdminCountryCurrencyRecord[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("marketplace_country_currencies")
    .select("country, currency")
    .order("country", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as CountryCurrencyRow[]).map((row) => ({
    country: row.country,
    currency: row.currency,
  }));
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
    buyerUsers: users.filter((item) => item.role === "buyer").length,
    sellerUsers: users.filter((item) => item.role === "seller").length,
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
