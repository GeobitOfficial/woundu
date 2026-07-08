import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BuyerOrderView } from "@/features/account/types";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  formatAccountDate,
  getBuyerOrderActionLabel,
} from "@/lib/account/orderStatusUi";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";

type AccountBuyerOrderListItemProps = Readonly<{
  order: BuyerOrderView;
  variant?: "compact" | "detailed";
}>;

const STATUS_ACCENT: Record<BuyerOrderView["status"], string> = {
  pending: "border-l-brand",
  paid: "border-l-brand-dark",
  processing: "border-l-indigo-500",
  completed: "border-l-emerald-500",
  cancelled: "border-l-slate-400",
  refunded: "border-l-violet-500",
};

export function AccountBuyerOrderListItem({
  order,
  variant = "compact",
}: AccountBuyerOrderListItemProps) {
  const orderHref = `/cuenta/pedidos/${order.id}`;
  const actionLabel = getBuyerOrderActionLabel(order.status);

  if (variant === "detailed") {
    return (
      <li>
        <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              className="font-mono text-xs font-bold text-brand hover:underline"
              href={orderHref}
            >
              #{order.id.slice(0, 8).toUpperCase()}
            </Link>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold",
                ORDER_STATUS_STYLE[order.status],
              )}
            >
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>
          <p className="mt-2 text-lg font-black text-slate-950">
            {formatMoney(order.total, order.currency)}
          </p>
          <p className="text-xs text-slate-500">{formatAccountDate(order.createdAt)}</p>
          <ul className="mt-3 space-y-1 border-t border-slate-200/80 pt-3 text-sm text-slate-700">
            {order.items.map((item) => (
              <li className="flex justify-between gap-2" key={item.id}>
                <span>
                  {item.productTitle}{" "}
                  <span className="text-slate-500">x{item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium">
                  {formatMoney(item.totalPrice, order.currency)}
                </span>
              </li>
            ))}
          </ul>
          <Link
            className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
            href={orderHref}
          >
            {actionLabel}
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </article>
      </li>
    );
  }

  return (
    <li>
      <article
        className={cn(
          "group rounded-xl border border-slate-200/60 border-l-4 bg-white/70 backdrop-blur-sm p-4 transition hover:bg-white hover:shadow-md hover:border-slate-200",
          STATUS_ACCENT[order.status],
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <Link
            className="font-mono text-xs font-bold text-brand hover:underline"
            href={orderHref}
          >
            #{order.id.slice(0, 8).toUpperCase()}
          </Link>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              ORDER_STATUS_STYLE[order.status],
            )}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </div>
        <p className="mt-2 text-lg font-black text-slate-950">
          {formatMoney(order.total, order.currency)}
        </p>
        <p className="text-[11px] text-slate-500">{formatAccountDate(order.createdAt)}</p>
        <Link
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline"
          href={orderHref}
        >
          {actionLabel}
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </article>
    </li>
  );
}
