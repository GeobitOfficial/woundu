import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  SellerEarningsMonthBucket,
  SellerEarningsSnapshot,
  SellerOrderLineView,
} from "@/features/account/types";
import {
  getDefaultSellerEarningsFilter,
  getSellerEarningsDateRange,
  type SellerEarningsFilter,
} from "@/lib/account/sellerEarningsPeriod";
import type { OrderStatus } from "@/types";

import { getSellerLocale } from "./getSellerLocale";

type ProductEmbed = {
  title: string;
  slug: string;
} | null;

type OrderEmbed = {
  id: string;
  status: OrderStatus;
  total: string | number;
  currency: string;
  created_at: string;
} | null;

type SellerOrderItemRow = {
  id: string;
  order_id: string;
  quantity: number;
  total_price: string | number;
  orders: OrderEmbed | OrderEmbed[] | null;
  products: ProductEmbed | ProductEmbed[] | null;
};

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (relation == null) {
    return null;
  }
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

function accumulateLineTotals(
  lines: ReadonlyArray<SellerOrderLineView>,
): SellerEarningsSnapshot["totals"] {
  let completedAmount = 0;
  let inProgressAmount = 0;
  let cancelledOrRefundedAmount = 0;
  let currency = "USD";

  for (const line of lines) {
    currency = line.currency || currency;
    if (line.orderStatus === "completed") {
      completedAmount += line.lineTotal;
    } else if (
      line.orderStatus === "pending" ||
      line.orderStatus === "paid" ||
      line.orderStatus === "processing"
    ) {
      inProgressAmount += line.lineTotal;
    } else if (
      line.orderStatus === "cancelled" ||
      line.orderStatus === "refunded"
    ) {
      cancelledOrRefundedAmount += line.lineTotal;
    }
  }

  return {
    completedAmount,
    inProgressAmount,
    cancelledOrRefundedAmount,
    currency,
  };
}

function monthKeyFromIso(iso: string): string {
  const date = new Date(iso);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabelFromKey(monthKey: string): string {
  const [yearPart, monthPart] = monthKey.split("-");
  const date = new Date(Date.UTC(Number(yearPart), Number(monthPart) - 1, 1));
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function buildMonthlyBreakdown(
  lines: ReadonlyArray<SellerOrderLineView>,
): ReadonlyArray<SellerEarningsMonthBucket> {
  const bucketMap = new Map<
    string,
    {
      completedAmount: number;
      inProgressAmount: number;
      cancelledOrRefundedAmount: number;
      unitsSold: number;
      orderIds: Set<string>;
    }
  >();

  for (const line of lines) {
    const key = monthKeyFromIso(line.orderCreatedAt);
    const bucket = bucketMap.get(key) ?? {
      completedAmount: 0,
      inProgressAmount: 0,
      cancelledOrRefundedAmount: 0,
      unitsSold: 0,
      orderIds: new Set<string>(),
    };

    bucket.orderIds.add(line.orderId);
    bucket.unitsSold += line.quantity;

    if (line.orderStatus === "completed") {
      bucket.completedAmount += line.lineTotal;
    } else if (
      line.orderStatus === "pending" ||
      line.orderStatus === "paid" ||
      line.orderStatus === "processing"
    ) {
      bucket.inProgressAmount += line.lineTotal;
    } else if (
      line.orderStatus === "cancelled" ||
      line.orderStatus === "refunded"
    ) {
      bucket.cancelledOrRefundedAmount += line.lineTotal;
    }

    bucketMap.set(key, bucket);
  }

  return [...bucketMap.entries()]
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([monthKey, bucket]) => ({
      monthKey,
      monthLabel: monthLabelFromKey(monthKey),
      completedAmount: bucket.completedAmount,
      inProgressAmount: bucket.inProgressAmount,
      cancelledOrRefundedAmount: bucket.cancelledOrRefundedAmount,
      ordersCount: bucket.orderIds.size,
      unitsSold: bucket.unitsSold,
    }));
}

export async function getSellerEarnings(
  supabase: SupabaseClient,
  userId: string,
  filter: SellerEarningsFilter,
): Promise<SellerEarningsSnapshot> {
  const range = getSellerEarningsDateRange(filter);
  const sellerLocale = await getSellerLocale(supabase, userId);

  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
        id,
        order_id,
        quantity,
        total_price,
        orders!inner ( id, status, total, currency, created_at ),
        products ( title, slug )
      `,
    )
    .eq("seller_id", userId)
    .gte("orders.created_at", range.startIso)
    .lt("orders.created_at", range.endIso)
    .order("created_at", { ascending: false });

  const lines: SellerOrderLineView[] =
    !error && data
      ? (data as SellerOrderItemRow[]).map((row) => {
          const order = firstRelation(row.orders);
          const product = firstRelation(row.products);
          return {
            id: row.id,
            orderId: row.order_id,
            orderStatus: order?.status ?? "pending",
            productTitle: product?.title ?? "Producto",
            productSlug: product?.slug ?? null,
            quantity: row.quantity,
            lineTotal: toNumber(row.total_price),
            currency: order?.currency ?? "USD",
            orderCreatedAt: order?.created_at ?? "",
          };
        })
      : [];

  const sellerCurrency = sellerLocale.currency;
  const currencyLines = lines.filter((line) => line.currency === sellerCurrency);
  const excludedOtherCurrencyCount = lines.length - currencyLines.length;

  const totals = accumulateLineTotals(currencyLines);
  totals.currency = sellerCurrency;
  const monthlyBreakdown = buildMonthlyBreakdown(currencyLines);

  const uniqueOrders = new Set(currencyLines.map((line) => line.orderId));
  const completedOrders = new Set(
    currencyLines
      .filter((line) => line.orderStatus === "completed")
      .map((line) => line.orderId),
  );
  const unitsSold = currencyLines.reduce((sum, line) => sum + line.quantity, 0);

  return {
    rangeLabel: range.label,
    rangeStartIso: range.startIso,
    rangeEndIso: range.endIso,
    sellerCurrency,
    totals,
    lines: currencyLines,
    monthlyBreakdown,
    ordersCount: uniqueOrders.size,
    unitsSold,
    completedOrdersCount: completedOrders.size,
    excludedOtherCurrencyCount,
  };
}

export async function getSellerEarningsForCurrentMonth(
  supabase: SupabaseClient,
  userId: string,
): Promise<Pick<SellerEarningsSnapshot, "totals" | "rangeLabel">> {
  const filter = getDefaultSellerEarningsFilter();
  const snapshot = await getSellerEarnings(supabase, userId, filter);
  return {
    totals: snapshot.totals,
    rangeLabel: snapshot.rangeLabel,
  };
}
