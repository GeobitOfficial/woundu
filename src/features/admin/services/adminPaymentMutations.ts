import { getCurrentUser, supabase } from "@/services/supabase/client";
import { isSuperAdmin } from "@/lib/auth/roles";
import { ADMIN_AUDIT_ACTIONS } from "@/lib/admin/auditActions";
import type { AdminDisputeRecord, AdminOrderRecord } from "@/features/admin/types";
import type {
  AdminDisputeCreateValues,
  AdminDisputeResolveValues,
  AdminOrderPaymentValues,
  AdminOrderRefundValues,
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

const DISPUTE_ADMIN_SELECT = `
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
`;

type DisputeAdminRow = {
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

  if (profileError || !profileRow || !isSuperAdmin(profileRow.role)) {
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

function mapAdminDispute(row: DisputeAdminRow): AdminDisputeRecord {
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

function getPaymentMutationError(message: string | undefined, entity: string) {
  if (!message) {
    return `No pudimos procesar ${entity}. Inténtalo de nuevo.`;
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "No tienes permisos de Super Admin para esta acción.";
  }

  return `No pudimos procesar ${entity}. Revisa los datos e inténtalo de nuevo.`;
}

export async function confirmOrderPaymentAsAdmin(
  orderId: string,
  values: AdminOrderPaymentValues,
): Promise<MutationResult<AdminOrderRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const patch = buildOrderStatusPatch("paid", values.paymentReference);
  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .select(ADMIN_ORDER_SELECT)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getPaymentMutationError(error?.message, "el pago"),
    };
  }

  const order = mapAdminOrder(data as unknown as OrderAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.ORDER_PAYMENT,
    entityType: "order",
    entityId: orderId,
    summary: `Pago confirmado para pedido ${orderId.slice(0, 8)}…`,
    metadata: { paymentReference: values.paymentReference, total: order.total },
  });

  return { data: order, error: null };
}

export async function processOrderRefundAsAdmin(
  orderId: string,
  values: AdminOrderRefundValues,
): Promise<MutationResult<AdminOrderRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("total")
    .eq("id", orderId)
    .single();

  if (orderError || !orderRow) {
    return { data: null, error: "No encontramos el pedido." };
  }

  const orderTotal = Number(orderRow.total);
  if (values.refundAmount > orderTotal) {
    return {
      data: null,
      error: `El reembolso no puede superar el total (${orderTotal}).`,
    };
  }

  const patch = buildOrderStatusPatch("refunded", values.paymentReference, {
    refundAmount: values.refundAmount,
    refundReason: values.refundReason,
  });

  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .select(ADMIN_ORDER_SELECT)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getPaymentMutationError(error?.message, "el reembolso"),
    };
  }

  const order = mapAdminOrder(data as unknown as OrderAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.ORDER_REFUND,
    entityType: "order",
    entityId: orderId,
    summary: `Reembolso de ${values.refundAmount} procesado`,
    metadata: {
      refundAmount: values.refundAmount,
      refundReason: values.refundReason,
    },
  });

  return { data: order, error: null };
}

export async function createOrderDisputeAsAdmin(
  values: AdminDisputeCreateValues,
): Promise<MutationResult<AdminDisputeRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("buyer_id")
    .eq("id", values.orderId)
    .single();

  if (orderError || !orderRow) {
    return { data: null, error: "No encontramos el pedido." };
  }

  const { data, error } = await supabase
    .from("order_disputes")
    .insert({
      order_id: values.orderId,
      opened_by: orderRow.buyer_id,
      reason: values.reason.trim(),
      buyer_note: values.buyerNote?.trim() ? values.buyerNote.trim() : null,
      status: "open",
    })
    .select(DISPUTE_ADMIN_SELECT)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getPaymentMutationError(error?.message, "la disputa"),
    };
  }

  const dispute = mapAdminDispute(data as unknown as DisputeAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.DISPUTE_CREATE,
    entityType: "order_dispute",
    entityId: dispute.id,
    summary: `Disputa abierta para pedido ${values.orderId.slice(0, 8)}…`,
    metadata: { orderId: values.orderId, reason: values.reason },
  });

  return { data: dispute, error: null };
}

export async function resolveOrderDisputeAsAdmin(
  disputeId: string,
  values: AdminDisputeResolveValues,
): Promise<MutationResult<AdminDisputeRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data: existing, error: existingError } = await supabase
    .from("order_disputes")
    .select("order_id, status")
    .eq("id", disputeId)
    .single();

  if (existingError || !existing) {
    return { data: null, error: "No encontramos la disputa." };
  }

  const now = new Date().toISOString();
  const patch: Record<string, string | number | null> = {
    status: values.status,
    admin_note: values.adminNote?.trim() ? values.adminNote.trim() : null,
    updated_at: now,
  };

  if (values.status === "approved_refund" || values.status === "closed") {
    patch.resolved_at = now;
    patch.resolved_by = session.userId;
  }

  if (values.refundAmount != null && values.refundAmount > 0) {
    patch.refund_amount = values.refundAmount;
  }

  const { data, error } = await supabase
    .from("order_disputes")
    .update(patch)
    .eq("id", disputeId)
    .select(DISPUTE_ADMIN_SELECT)
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getPaymentMutationError(error?.message, "la resolución"),
    };
  }

  if (
    values.processRefund &&
    values.refundAmount != null &&
    values.refundAmount > 0
  ) {
    const refundResult = await processOrderRefundAsAdmin(existing.order_id, {
      refundAmount: values.refundAmount,
      refundReason:
        values.adminNote?.trim() ||
        "Reembolso aprobado tras resolución de disputa.",
      paymentReference: "",
    });

    if (refundResult.error) {
      return { data: null, error: refundResult.error };
    }
  }

  const dispute = mapAdminDispute(data as unknown as DisputeAdminRow);

  await logAdminAction({
    action: ADMIN_AUDIT_ACTIONS.DISPUTE_RESOLVE,
    entityType: "order_dispute",
    entityId: disputeId,
    summary: `Disputa marcada como ${values.status}`,
    metadata: {
      orderId: existing.order_id,
      status: values.status,
      processRefund: values.processRefund,
      refundAmount: values.refundAmount ?? null,
    },
  });

  return { data: dispute, error: null };
}

export { mapAdminDispute };
