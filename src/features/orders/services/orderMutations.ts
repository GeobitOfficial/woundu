import { getCurrentUser, supabase } from "@/services/supabase/client";
import { hasCompleteBuyerShippingProfile } from "@/lib/account/buyerShippingProfile";
import { canAccessBuyerFeatures } from "@/lib/auth/roles";
import type { UserRole } from "@/types";
import type {
  BuyerCancelOrderValues,
  BuyerPaymentReportValues,
  SellerOrderActionValues,
} from "@/validations/order";

async function requireUser() {
  const { data, error } = await getCurrentUser();
  if (error || !data.user) {
    return { ok: false as const, error: "Debes iniciar sesión." };
  }

  return { ok: true as const, userId: data.user.id };
}

function mapOrderError(message: string | undefined, fallback: string) {
  if (!message) {
    return fallback;
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "No tienes permiso para esta acción.";
  }

  return fallback;
}

export async function buyerReportPaymentForOrder(
  orderId: string,
  values: BuyerPaymentReportValues,
): Promise<{ error: string | null }> {
  const session = await requireUser();
  if (!session.ok) {
    return { error: session.error };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_reference: values.paymentReference.trim(),
      status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("buyer_id", session.userId)
    .eq("status", "pending");

  if (error) {
    return {
      error: mapOrderError(
        error.message,
        "No pudimos registrar tu pago. Verifica que el pedido siga pendiente.",
      ),
    };
  }

  return { error: null };
}

export async function buyerCancelOrder(
  orderId: string,
  _values?: BuyerCancelOrderValues,
): Promise<{ error: string | null }> {
  const session = await requireUser();
  if (!session.ok) {
    return { error: session.error };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      cancelled_at: now,
      updated_at: now,
    })
    .eq("id", orderId)
    .eq("buyer_id", session.userId)
    .in("status", ["pending", "paid"]);

  if (error) {
    return {
      error: mapOrderError(error.message, "No pudimos cancelar el pedido."),
    };
  }

  return { error: null };
}

async function sellerOwnsOrder(orderId: string, sellerId: string) {
  const { data } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .eq("seller_id", sellerId)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

export async function sellerConfirmPaymentReceived(
  orderId: string,
  _values?: SellerOrderActionValues,
): Promise<{ error: string | null }> {
  const session = await requireUser();
  if (!session.ok) {
    return { error: session.error };
  }

  if (!(await sellerOwnsOrder(orderId, session.userId))) {
    return { error: "Este pedido no incluye tus productos." };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "paid");

  if (error) {
    return {
      error: mapOrderError(
        error.message,
        "No pudimos confirmar el pago. El comprador debe reportarlo primero.",
      ),
    };
  }

  return { error: null };
}

export async function sellerCompleteOrder(
  orderId: string,
  _values?: SellerOrderActionValues,
): Promise<{ error: string | null }> {
  const session = await requireUser();
  if (!session.ok) {
    return { error: session.error };
  }

  if (!(await sellerOwnsOrder(orderId, session.userId))) {
    return { error: "Este pedido no incluye tus productos." };
  }

  const now = new Date().toISOString();
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .update({
      status: "completed",
      completed_at: now,
      updated_at: now,
    })
    .eq("id", orderId)
    .in("status", ["paid", "processing"])
    .select("id")
    .maybeSingle();

  if (orderError || !orderRow) {
    return {
      error: mapOrderError(
        orderError?.message,
        "No pudimos completar el pedido.",
      ),
    };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id")
    .eq("order_id", orderId)
    .eq("seller_id", session.userId);

  const productIds = (
    (items ?? []) as ReadonlyArray<{ product_id: string }>
  ).map((item) => item.product_id);

  if (productIds.length > 0) {
    await supabase
      .from("products")
      .update({ status: "sold", updated_at: now })
      .in("id", productIds)
      .eq("seller_id", session.userId);
  }

  return { error: null };
}

export async function sellerCancelOrder(
  orderId: string,
  _values?: SellerOrderActionValues,
): Promise<{ error: string | null }> {
  const session = await requireUser();
  if (!session.ok) {
    return { error: session.error };
  }

  if (!(await sellerOwnsOrder(orderId, session.userId))) {
    return { error: "Este pedido no incluye tus productos." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      cancelled_at: now,
      updated_at: now,
    })
    .eq("id", orderId)
    .in("status", ["pending", "paid", "processing"]);

  if (error) {
    return {
      error: mapOrderError(error.message, "No pudimos cancelar el pedido."),
    };
  }

  return { error: null };
}

type ProductPurchaseRow = Readonly<{
  id: string;
  seller_id: string;
  price: string | number;
  currency: string;
  status: string;
  stock: number;
  deleted_at: string | null;
}>;

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

/** Crea un pedido `pending` con una sola línea (compra directa sin pasarela). */
export async function createPendingOrderForProduct(
  productId: string,
): Promise<{ data: { orderId: string } | null; error: string | null }> {
  const session = await requireUser();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const buyerId = session.userId;

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select("id, seller_id, price, currency, status, stock, deleted_at")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !productRow) {
    return { data: null, error: "No encontramos ese producto." };
  }

  const product = productRow as ProductPurchaseRow;

  if (product.deleted_at != null || product.status !== "active") {
    return { data: null, error: "Este producto ya no está disponible." };
  }

  if (product.stock <= 0) {
    return { data: null, error: "Este producto está agotado." };
  }

  if (product.seller_id === buyerId) {
    return { data: null, error: "No puedes comprar tu propia publicación." };
  }

  const { data: buyerProfile, error: buyerProfileError } = await supabase
    .from("profiles")
    .select("role, country, shipping_city, shipping_address, phone")
    .eq("id", buyerId)
    .maybeSingle();

  if (buyerProfileError || !buyerProfile) {
    return { data: null, error: "No pudimos validar tu perfil." };
  }

  const profileRow = buyerProfile as {
    role: UserRole;
    country: string | null;
    shipping_city: string | null;
    shipping_address: string | null;
    phone: string | null;
  };

  if (!canAccessBuyerFeatures(profileRow.role)) {
    return {
      data: null,
      error: "Tu rol no permite realizar compras en el marketplace.",
    };
  }

  if (
    !hasCompleteBuyerShippingProfile({
      country: profileRow.country,
      shippingCity: profileRow.shipping_city,
      shippingAddress: profileRow.shipping_address,
      phone: profileRow.phone,
    })
  ) {
    return {
      data: null,
      error:
        "Configura tus datos de envio (pais, ciudad, direccion y telefono) en tu perfil antes de comprar.",
    };
  }

  const price = toNumber(product.price);
  const currency = product.currency;

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: buyerId,
      status: "pending",
      subtotal: price,
      total: price,
      currency,
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    return {
      data: null,
      error: "No pudimos crear el pedido. Inténtalo de nuevo.",
    };
  }

  const orderId = String(orderRow.id);

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: orderId,
    product_id: productId,
    seller_id: product.seller_id,
    quantity: 1,
    unit_price: price,
    total_price: price,
  });

  if (itemError) {
    await supabase.from("orders").delete().eq("id", orderId);
    const message = itemError.message?.includes("PRODUCT_OUT_OF_STOCK")
      ? "Este producto está agotado."
      : "No pudimos completar el pedido. Inténtalo de nuevo.";
    return {
      data: null,
      error: message,
    };
  }

  return { data: { orderId }, error: null };
}
