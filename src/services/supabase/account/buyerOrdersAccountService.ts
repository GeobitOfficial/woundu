import type { SupabaseClient } from "@supabase/supabase-js";

import { ACCOUNT_BUYER_ORDERS_PAGE_SIZE } from "@/features/account/orderConstants";
import type { BuyerOrderView } from "@/features/account/types";
import type { OrderStatus } from "@/types";

type ProductEmbed = {
  title: string;
  slug: string;
} | null;

type OrderItemRow = {
  id: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  product_id: string;
  products: ProductEmbed | ProductEmbed[] | null;
};

export type BuyerOrderRow = {
  id: string;
  status: OrderStatus;
  subtotal: string | number;
  total: string | number;
  currency: string;
  created_at: string;
  order_items: OrderItemRow[] | null;
};

const BUYER_ORDER_SELECT = `
  id,
  status,
  subtotal,
  total,
  currency,
  created_at,
  order_items (
    id,
    quantity,
    unit_price,
    total_price,
    product_id,
    products ( title, slug )
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

export function mapBuyerOrderRows(
  rows: ReadonlyArray<BuyerOrderRow>,
): BuyerOrderView[] {
  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    total: toNumber(row.total),
    currency: row.currency,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => {
      const product = firstRelation(item.products);

      return {
        id: item.id,
        productTitle: product?.title ?? "Producto",
        productSlug: product?.slug ?? null,
        quantity: item.quantity,
        totalPrice: toNumber(item.total_price),
      };
    }),
  }));
}

export type BuyerOrdersPage = Readonly<{
  items: ReadonlyArray<BuyerOrderView>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

export async function getBuyerOrdersPaginated(
  supabase: SupabaseClient,
  userId: string,
  page: number,
  pageSize: number = ACCOUNT_BUYER_ORDERS_PAGE_SIZE,
): Promise<BuyerOrdersPage> {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { count, data, error } = await supabase
    .from("orders")
    .select(BUYER_ORDER_SELECT, { count: "exact" })
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return {
      items: [],
      page: safePage,
      pageSize,
      total: 0,
      totalPages: 0,
    };
  }

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items: mapBuyerOrderRows(data as BuyerOrderRow[]),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}
