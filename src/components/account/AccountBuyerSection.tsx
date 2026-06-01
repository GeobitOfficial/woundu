import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import type { BuyerOrderView } from "@/features/account/types";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  formatAccountDate,
} from "@/lib/account/orderStatusUi";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";

type AccountBuyerSectionProps = Readonly<{
  buyerOrders: ReadonlyArray<BuyerOrderView>;
}>;

export function AccountBuyerSection({ buyerOrders }: AccountBuyerSectionProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
      <div className="flex items-center gap-2">
        <ShoppingBag aria-hidden className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-black text-slate-950">Mis compras</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Historial de pedidos donde eres comprador.
      </p>

      {buyerOrders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-brand/25 bg-brand-light/40 px-4 py-10 text-center text-sm text-slate-600">
          Aun no tienes pedidos. Explora el{" "}
          <Link className="font-bold text-brand underline" href="/marketplace">
            marketplace
          </Link>
          .
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {buyerOrders.map((order) => (
            <li
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              key={order.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-mono text-slate-500">
                  {order.id.slice(0, 8)}…
                </p>
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
              <p className="text-xs text-slate-500">
                {formatAccountDate(order.createdAt)}
              </p>
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
