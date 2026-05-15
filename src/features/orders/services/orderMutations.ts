import { getCurrentUser, supabase } from "@/services/supabase/client";

type ProductPurchaseRow = Readonly<{
  id: string;
  seller_id: string;
  price: string | number;
  currency: string;
  status: string;
  deleted_at: string | null;
}>;

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

/**
 * Crea un pedido `pending` con una sola linea (MVP de compra sin pasarela).
 */
export async function createPendingOrderForProduct(
  productId: string,
): Promise<{ data: { orderId: string } | null; error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();

  if (userError || !userData.user) {
    return {
      data: null,
      error: "Inicia sesion para comprar.",
    };
  }

  const buyerId = userData.user.id;

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select("id, seller_id, price, currency, status, deleted_at")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !productRow) {
    return { data: null, error: "No encontramos ese producto." };
  }

  const product = productRow as ProductPurchaseRow;

  if (product.deleted_at != null || product.status !== "active") {
    return { data: null, error: "Este producto ya no esta disponible." };
  }

  if (product.seller_id === buyerId) {
    return { data: null, error: "No puedes comprar tu propia publicacion." };
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
      error: "No pudimos crear el pedido. Intentalo de nuevo.",
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
    return {
      data: null,
      error: "No pudimos completar el pedido. Intentalo de nuevo.",
    };
  }

  return { data: { orderId }, error: null };
}
