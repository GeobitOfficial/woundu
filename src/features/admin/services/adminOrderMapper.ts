import type { AdminOrderRecord } from "../types";

export const ADMIN_ORDER_SELECT = `
  id,
  buyer_id,
  status,
  subtotal,
  total,
  currency,
  payment_reference,
  refunded_at,
  refund_amount,
  refund_reason,
  created_at,
  updated_at,
  completed_at,
  cancelled_at,
  profiles!orders_buyer_id_fkey ( full_name, email ),
  order_items (
    id,
    product_id,
    seller_id,
    quantity,
    unit_price,
    total_price,
    profiles!order_items_seller_id_fkey ( full_name, email ),
    products ( title, slug, city, country )
  )
`;

export type OrderAdminRow = {
  id: string;
  buyer_id: string;
  status: AdminOrderRecord["status"];
  subtotal: string | number;
  total: string | number;
  currency: string;
  payment_reference: string | null;
  refunded_at: string | null;
  refund_amount: string | number | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  profiles:
    | { full_name: string; email: string | null }
    | { full_name: string; email: string | null }[]
    | null;
  order_items: OrderItemAdminRow[] | null;
};

type OrderItemAdminRow = {
  id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  profiles:
    | { full_name: string; email: string | null }
    | { full_name: string; email: string | null }[]
    | null;
  products:
    | {
        title: string;
        slug: string;
        city: string | null;
        country: string | null;
      }
    | {
        title: string;
        slug: string;
        city: string | null;
        country: string | null;
      }[]
    | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export function mapAdminOrder(row: OrderAdminRow): AdminOrderRecord {
  const buyer = firstRelation(row.profiles);
  const lines = (row.order_items ?? []).map((item) => {
    const seller = firstRelation(item.profiles);
    const product = firstRelation(item.products);

    return {
      id: item.id,
      productId: item.product_id,
      productTitle: product?.title ?? "Producto",
      productSlug: product?.slug ?? "",
      productCity: product?.city ?? null,
      productCountry: product?.country ?? null,
      sellerId: item.seller_id,
      sellerName: seller?.full_name ?? "Vendedor",
      sellerEmail: seller?.email ?? null,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      totalPrice: Number(item.total_price),
    };
  });

  return {
    id: row.id,
    status: row.status,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    currency: row.currency,
    paymentReference: row.payment_reference,
    refundedAt: row.refunded_at,
    refundAmount: row.refund_amount != null ? Number(row.refund_amount) : null,
    refundReason: row.refund_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    buyerId: row.buyer_id,
    buyerName: buyer?.full_name ?? "Comprador",
    buyerEmail: buyer?.email ?? null,
    lines,
  };
}

export function buildOrderStatusPatch(
  status: AdminOrderRecord["status"],
  paymentReference?: string | null,
  refund?: Readonly<{
    refundAmount: number;
    refundReason: string;
  }>,
): Record<string, string | number | null> {
  const now = new Date().toISOString();
  const patch: Record<string, string | number | null> = {
    status,
    updated_at: now,
  };

  if (paymentReference?.trim()) {
    patch.payment_reference = paymentReference.trim();
  }

  if (status === "completed") {
    patch.completed_at = now;
  }

  if (status === "cancelled") {
    patch.cancelled_at = now;
  }

  if (status === "refunded") {
    patch.cancelled_at = now;
    patch.refunded_at = now;
    if (refund) {
      patch.refund_amount = refund.refundAmount;
      patch.refund_reason = refund.refundReason.trim();
    }
  }

  return patch;
}
