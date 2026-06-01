import { getCurrentUser, supabase } from "@/services/supabase/client";
import type { AdminOrderRecord, AdminProductRecord, AdminUserRecord } from "@/features/admin/types";
import type { ProductStatus } from "@/types";
import type { AdminOrderStatusValues, AdminProductUpdateValues, AdminUserBanValues } from "@/validations/admin";
import {
  ADMIN_ORDER_SELECT,
  buildOrderStatusPatch,
  mapAdminOrder,
  type OrderAdminRow,
} from "./adminOrderMapper";
type MutationResult<T> = Readonly<{
  data: T | null;
  error: string | null;
}>;

type ProductAdminRow = {
  id: string;
  seller_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  price: string | number;
  currency: string;
  condition: AdminProductRecord["condition"];
  status: ProductStatus;
  city: string | null;
  country: string | null;
  moderation_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
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
  role: AdminUserRecord["role"];
  reputation_score: string | number;
  reviews_count: number;
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
};

async function ensureSuperAdminSession() {
  const { data, error } = await getCurrentUser();
  if (error || !data.user) {
    return { ok: false as const, error: "Debes iniciar sesión como Super Admin." };
  }

  return { ok: true as const, userId: data.user.id };
}

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

export async function updateProductAsAdmin(
  productId: string,
  values: AdminProductUpdateValues,
): Promise<MutationResult<AdminProductRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      title: values.title,
      description: values.description,
      price: values.price,
      status: values.status,
      moderation_note: values.moderationNote?.trim()
        ? values.moderationNote.trim()
        : null,
      city: values.city?.trim() ? values.city.trim() : null,
      country: values.country?.trim() ? values.country.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select(
      `
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
      categories ( name ),
      profiles!products_seller_id_fkey ( full_name, email )
    `,
    )
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getAdminMutationError(error?.message, "producto"),
    };
  }

  return { data: mapAdminProduct(data as unknown as ProductAdminRow), error: null };
}

export async function setUserBanAsAdmin(
  userId: string,
  values: AdminUserBanValues,
): Promise<MutationResult<AdminUserRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_banned: values.isBanned,
      banned_at: values.isBanned ? new Date().toISOString() : null,
      ban_reason: values.isBanned
        ? values.banReason?.trim()
          ? values.banReason.trim()
          : "Cuenta suspendida por moderación."
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(
      "id, full_name, email, username, role, reputation_score, reviews_count, is_banned, banned_at, ban_reason, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getAdminMutationError(error?.message, "usuario"),
    };
  }

  return { data: mapAdminUser(data as ProfileAdminRow), error: null };
}

export async function updateOrderStatusAsAdmin(
  orderId: string,
  values: AdminOrderStatusValues,
): Promise<MutationResult<AdminOrderRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const patch = buildOrderStatusPatch(values.status, values.paymentReference);

  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .select(ADMIN_ORDER_SELECT)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getAdminMutationError(error?.message, "pedido"),
    };
  }

  return {
    data: mapAdminOrder(data as unknown as OrderAdminRow),
    error: null,
  };
}

function getAdminMutationError(message: string | undefined, entity: string) {
  if (!message) {
    return `No pudimos actualizar el ${entity}. Inténtalo de nuevo.`;
  }

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("row-level security")) {
    return "No tienes permisos de Super Admin para esta acción.";
  }

  return `No pudimos actualizar el ${entity}. Revisa los datos e inténtalo de nuevo.`;
}
