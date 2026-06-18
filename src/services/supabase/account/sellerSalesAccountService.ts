import type { SupabaseClient } from "@supabase/supabase-js";

import {
  SELLER_SALES_PAGE_SIZE,
  type SellerSalesTab,
} from "@/features/account/sellerSalesConstants";
import type { SellerOrderLineView } from "@/features/account/types";
import { SELLER_SALES_TAB_STATUSES } from "@/lib/account/sellerSalesGroups";
import type { OrderStatus } from "@/types";
import { pickPrimaryImagePath } from "@/utils/productDisplay";

type BuyerProfileEmbed = {
  full_name: string;
  country: string | null;
  shipping_city: string | null;
  shipping_address: string | null;
  phone: string | null;
} | null;

type ProductImageEmbed = {
  storage_path: string;
  sort_order: number;
  is_primary: boolean;
};

type ProductEmbed = {
  title: string;
  slug: string;
  product_images: ProductImageEmbed[] | null;
} | null;

type OrderEmbed = {
  id: string;
  status: OrderStatus;
  total: string | number;
  currency: string;
  created_at: string;
  buyer_id: string;
  payment_reference: string | null;
  profiles: BuyerProfileEmbed | BuyerProfileEmbed[] | null;
} | null;

export type SellerOrderItemRow = {
  id: string;
  order_id: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  orders: OrderEmbed | OrderEmbed[] | null;
  products: ProductEmbed | ProductEmbed[] | null;
};

export const SELLER_SALE_SELECT = `
  id,
  order_id,
  quantity,
  unit_price,
  total_price,
  orders!inner (
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
`;

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (relation == null) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

export function mapSellerOrderRows(
  rows: ReadonlyArray<SellerOrderItemRow>,
): SellerOrderLineView[] {
  return rows.map((row) => {
    const order = firstRelation(row.orders);
    const product = firstRelation(row.products);
    const buyer = firstRelation(order?.profiles ?? null);

    return {
      id: row.id,
      orderId: row.order_id,
      orderStatus: order?.status ?? "pending",
      productTitle: product?.title ?? "Producto",
      productSlug: product?.slug ?? null,
      productImagePath: pickPrimaryImagePath(product?.product_images),
      quantity: row.quantity,
      unitPrice: toNumber(row.unit_price),
      lineTotal: toNumber(row.total_price),
      currency: order?.currency ?? "USD",
      orderCreatedAt: order?.created_at ?? "",
      orderTotal: toNumber(order?.total ?? 0),
      paymentReference: order?.payment_reference ?? null,
      buyerId: order?.buyer_id ?? "",
      buyerName: buyer?.full_name ?? "Comprador",
      buyerCountry: buyer?.country?.trim() ? buyer.country.trim() : null,
      buyerShippingCity: buyer?.shipping_city?.trim()
        ? buyer.shipping_city.trim()
        : null,
      buyerShippingAddress: buyer?.shipping_address?.trim()
        ? buyer.shipping_address.trim()
        : null,
      buyerPhone: buyer?.phone?.trim() ? buyer.phone.trim() : null,
    };
  });
}

export type SellerSalesPage = Readonly<{
  items: ReadonlyArray<SellerOrderLineView>;
  page: number;
  pageSize: number;
  tab: SellerSalesTab;
  total: number;
  totalPages: number;
}>;

export type SellerSalesCounts = Readonly<{
  pendientes: number;
  finalizadas: number;
}>;

export async function getSellerSalesCounts(
  supabase: SupabaseClient,
  userId: string,
): Promise<SellerSalesCounts> {
  const [pendingResult, finalizedResult] = await Promise.all([
    supabase
      .from("order_items")
      .select("id, orders!inner(status)", { count: "exact", head: true })
      .eq("seller_id", userId)
      .in("orders.status", [...SELLER_SALES_TAB_STATUSES.pendientes]),
    supabase
      .from("order_items")
      .select("id, orders!inner(status)", { count: "exact", head: true })
      .eq("seller_id", userId)
      .in("orders.status", [...SELLER_SALES_TAB_STATUSES.finalizadas]),
  ]);

  return {
    pendientes: pendingResult.count ?? 0,
    finalizadas: finalizedResult.count ?? 0,
  };
}

export async function getSellerSalesPaginated(
  supabase: SupabaseClient,
  userId: string,
  tab: SellerSalesTab,
  page: number,
  pageSize: number = SELLER_SALES_PAGE_SIZE,
): Promise<SellerSalesPage> {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  const statuses = SELLER_SALES_TAB_STATUSES[tab];

  const { count, data, error } = await supabase
    .from("order_items")
    .select(SELLER_SALE_SELECT, { count: "exact" })
    .eq("seller_id", userId)
    .in("orders.status", [...statuses])
    .order("created_at", { ascending: false, referencedTable: "orders" })
    .range(from, to);

  if (error || !data) {
    return {
      items: [],
      page: safePage,
      pageSize,
      tab,
      total: 0,
      totalPages: 0,
    };
  }

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items: mapSellerOrderRows(data as SellerOrderItemRow[]),
    page: safePage,
    pageSize,
    tab,
    total,
    totalPages,
  };
}
