import { createSupabaseServerClient } from "@/services/supabase/server";
import { getAuthenticatedUser } from "@/services/supabase/auth/getAuthenticatedUser";
import { getSellerPayoutProfileForUser } from "@/features/account/services/payoutReadService";
import { isSuperAdmin } from "@/lib/auth/roles";
import type { OrderDetailView, SellerPayoutProfile } from "@/features/orders/types";
import { getReviewsByProductIdsForBuyer } from "@/features/reviews/services/reviewReadService";
import type { OrderStatus } from "@/types";

const ORDER_DETAIL_SELECT = `
  id,
  buyer_id,
  status,
  subtotal,
  total,
  currency,
  payment_reference,
  refund_amount,
  refund_reason,
  created_at,
  updated_at,
  completed_at,
  cancelled_at,
  profiles!orders_buyer_id_fkey (
    full_name,
    country,
    shipping_city,
    shipping_address,
    phone
  ),
  order_items (
    id,
    product_id,
    seller_id,
    quantity,
    unit_price,
    total_price,
    products ( title, slug ),
    profiles!order_items_seller_id_fkey ( full_name )
  )
`;

type OrderDetailRow = {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  subtotal: string | number;
  total: string | number;
  currency: string;
  payment_reference: string | null;
  refund_amount: string | number | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  profiles:
    | {
        full_name: string;
        country: string | null;
        shipping_city: string | null;
        shipping_address: string | null;
        phone: string | null;
      }
    | {
        full_name: string;
        country: string | null;
        shipping_city: string | null;
        shipping_address: string | null;
        phone: string | null;
      }[]
    | null;
  order_items: OrderItemDetailRow[] | null;
};

type OrderItemDetailRow = {
  id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  products: { title: string; slug: string } | { title: string; slug: string }[] | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getOrderDetailForViewer(
  orderId: string,
): Promise<OrderDetailView | null> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as OrderDetailRow;
  const buyer = firstRelation(row.profiles);
  const lines = (row.order_items ?? []).map((item) => {
    const product = firstRelation(item.products);
    const seller = firstRelation(item.profiles);

    return {
      id: item.id,
      productId: item.product_id,
      productTitle: product?.title ?? "Producto",
      productSlug: product?.slug ?? "",
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      totalPrice: Number(item.total_price),
      sellerId: item.seller_id,
      sellerName: seller?.full_name ?? "Vendedor",
    };
  });

  const isBuyer = row.buyer_id === user.id;
  const isSeller = lines.some((line) => line.sellerId === user.id);
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!isBuyer && !isSeller && !isSuperAdmin(profileRow?.role)) {
    return null;
  }

  const productIds = lines.map((line) => line.productId);
  const reviewMap =
    isBuyer && row.status === "completed"
      ? await getReviewsByProductIdsForBuyer(user.id, productIds)
      : new Map();

  const linesWithReviews = lines.map((line) => ({
    ...line,
    review: reviewMap.get(line.productId) ?? null,
  }));

  let sellerPayout: SellerPayoutProfile | null = null;
  const primarySellerId = lines[0]?.sellerId;

  if (isBuyer && primarySellerId) {
    sellerPayout = await getSellerPayoutProfileForUser(primarySellerId);
  }

  return {
    id: row.id,
    status: row.status,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    currency: row.currency,
    paymentReference: row.payment_reference,
    refundAmount: row.refund_amount != null ? Number(row.refund_amount) : null,
    refundReason: row.refund_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    buyerId: row.buyer_id,
    buyerName: buyer?.full_name ?? "Comprador",
    buyerCountry: buyer?.country?.trim() ? buyer.country.trim() : null,
    buyerShippingCity: buyer?.shipping_city?.trim()
      ? buyer.shipping_city.trim()
      : null,
    buyerShippingAddress: buyer?.shipping_address?.trim()
      ? buyer.shipping_address.trim()
      : null,
    buyerPhone: buyer?.phone?.trim() ? buyer.phone.trim() : null,
    lines: linesWithReviews,
    sellerPayout,
    viewerRole: isBuyer ? "buyer" : isSeller ? "seller" : "admin",
  };
}

export async function getSellerPayoutForAccount(
  userId: string,
): Promise<SellerPayoutProfile | null> {
  return getSellerPayoutProfileForUser(userId);
}
