import { getCurrentUser, supabase } from "@/services/supabase/client";
import { isSuperAdmin } from "@/lib/auth/roles";
import { ADMIN_AUDIT_ACTIONS } from "@/lib/admin/auditActions";
import type {
  AdminCountryCurrencyRecord,
  AdminOrderRecord,
  AdminProductRecord,
  AdminUserRecord,
} from "@/features/admin/types";
import type { ProductStatus } from "@/types";
import type {
  AdminCountryCurrencyValues,
  AdminOrderStatusValues,
  AdminProductModerationValues,
  AdminProductRestoreValues,
  AdminProductUpdateValues,
  AdminUserBanValues,
  AdminUserLocaleValues,
  AdminUserRoleValues,
} from "@/validations/admin";
import { logAdminAction } from "./adminAuditMutations";
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
  country: string | null;
  currency: string | null;
  reputation_score: string | number;
  reviews_count: number;
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
};

const PROFILE_ADMIN_SELECT =
  "id, full_name, email, username, role, country, currency, reputation_score, reviews_count, is_banned, banned_at, ban_reason, created_at, updated_at";

async function ensureSuperAdminSession() {
  const { data, error } = await getCurrentUser();
  if (error || !data.user) {
    return { ok: false as const, error: "Debes iniciar sesión como Super Admin." };
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profileRow || !isSuperAdmin(profileRow.role as AdminUserRecord["role"])) {
    return { ok: false as const, error: "No tienes permisos de Super Admin." };
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
    deletedAt: null,
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

  const product = mapAdminProduct(data as unknown as ProductAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.PRODUCT_UPDATE,
    entityType: "product",
    entityId: productId,
    summary: `Producto "${product.title}" actualizado`,
    metadata: { status: values.status },
  });

  return { data: product, error: null };
}

export async function setProductModerationAsAdmin(
  productId: string,
  values: AdminProductModerationValues,
): Promise<MutationResult<AdminProductRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      status: values.status,
      moderation_note: values.moderationNote?.trim()
        ? values.moderationNote.trim()
        : null,
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

  const moderated = mapAdminProduct(data as unknown as ProductAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.PRODUCT_MODERATION,
    entityType: "product",
    entityId: productId,
    summary: `Producto "${moderated.title}" marcado como ${values.status}`,
    metadata: { status: values.status },
  });

  return { data: moderated, error: null };
}

export async function restoreProductAsAdmin(
  productId: string,
  values: AdminProductRestoreValues,
): Promise<MutationResult<AdminProductRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      deleted_at: null,
      status: values.status,
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
      deleted_at,
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
      error: getAdminMutationError(error?.message, "restauración del producto"),
    };
  }

  const restored = mapAdminProduct(data as unknown as ProductAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.PRODUCT_RESTORE,
    entityType: "product",
    entityId: productId,
    summary: `Producto "${restored.title}" restaurado`,
    metadata: { status: values.status },
  });

  return { data: restored, error: null };
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
    .select(PROFILE_ADMIN_SELECT)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getAdminMutationError(error?.message, "usuario"),
    };
  }

  const user = mapAdminUser(data as ProfileAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.USER_BAN,
    entityType: "profile",
    entityId: userId,
    summary: values.isBanned
      ? `Usuario "${user.fullName}" baneado`
      : `Usuario "${user.fullName}" reactivado`,
    metadata: { isBanned: values.isBanned, banReason: values.banReason ?? null },
  });

  return { data: user, error: null };
}

export async function setUserRoleAsAdmin(
  userId: string,
  values: AdminUserRoleValues,
): Promise<MutationResult<AdminUserRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      role: values.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(PROFILE_ADMIN_SELECT)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getAdminMutationError(error?.message, "rol del usuario"),
    };
  }

  const user = mapAdminUser(data as ProfileAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.USER_ROLE,
    entityType: "profile",
    entityId: userId,
    summary: `Rol de "${user.fullName}" cambiado a ${values.role}`,
    metadata: { role: values.role },
  });

  return { data: user, error: null };
}

export async function setUserLocaleAsAdmin(
  userId: string,
  values: AdminUserLocaleValues,
): Promise<MutationResult<AdminUserRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const patch: {
    country: string;
    currency?: string;
    updated_at: string;
  } = {
    country: values.country.trim(),
    updated_at: new Date().toISOString(),
  };

  if (values.currency?.trim()) {
    patch.currency = values.currency.trim().toUpperCase();
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select(PROFILE_ADMIN_SELECT)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getAdminMutationError(error?.message, "ubicación del usuario"),
    };
  }

  const user = mapAdminUser(data as ProfileAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.USER_LOCALE,
    entityType: "profile",
    entityId: userId,
    summary: `País/moneda de "${user.fullName}" actualizados`,
    metadata: { country: values.country, currency: values.currency ?? null },
  });

  return { data: user, error: null };
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

  const order = mapAdminOrder(data as unknown as OrderAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.ORDER_STATUS,
    entityType: "order",
    entityId: orderId,
    summary: `Pedido ${orderId.slice(0, 8)}… marcado como ${values.status}`,
    metadata: { status: values.status },
  });

  return {
    data: order,
    error: null,
  };
}

export async function updateCountryCurrencyAsAdmin(
  values: AdminCountryCurrencyValues,
): Promise<MutationResult<AdminCountryCurrencyRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("marketplace_country_currencies")
    .update({ currency: values.currency })
    .eq("country", values.country)
    .select("country, currency")
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getAdminMutationError(error?.message, "moneda del país"),
    };
  }

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.COUNTRY_CURRENCY,
    entityType: "country_currency",
    entityId: values.country,
    summary: `Moneda de ${values.country} actualizada a ${values.currency}`,
    metadata: { currency: values.currency },
  });

  return {
    data: { country: data.country, currency: data.currency },
    error: null,
  };
}

export async function deleteReviewAsAdmin(
  reviewId: string,
): Promise<MutationResult<{ id: string }>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    return {
      data: null,
      error: getAdminMutationError(error?.message, "reseña"),
    };
  }

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.REVIEW_DELETE,
    entityType: "review",
    entityId: reviewId,
    summary: `Reseña ${reviewId.slice(0, 8)}… eliminada`,
  });

  return { data: { id: reviewId }, error: null };
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
