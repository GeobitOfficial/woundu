import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { AccountBuyerOrderListItem } from "@/components/account/AccountBuyerOrderListItem";
import { AccountBuyerOrdersViewAllLink } from "@/components/account/AccountBuyerOrdersViewAllLink";
import { ACCOUNT_BUYER_ORDERS_PREVIEW_COUNT } from "@/features/account/orderConstants";
import type { BuyerOrderView } from "@/features/account/types";

type AccountBuyerSectionProps = Readonly<{
  buyerOrders: ReadonlyArray<BuyerOrderView>;
}>;

export function AccountBuyerSection({ buyerOrders }: AccountBuyerSectionProps) {
  const previewOrders = buyerOrders.slice(0, ACCOUNT_BUYER_ORDERS_PREVIEW_COUNT);

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag aria-hidden className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-black text-slate-950">Mis compras</h2>
        </div>
        {buyerOrders.length > 0 ? (
          <Link
            className="text-xs font-bold text-brand hover:underline"
            href="/cuenta/compras"
          >
            Ver todas
          </Link>
        ) : null}
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
        <>
          <ul className="mt-5 grid gap-3">
            {previewOrders.map((order) => (
              <AccountBuyerOrderListItem
                key={order.id}
                order={order}
                variant="detailed"
              />
            ))}
          </ul>
          <AccountBuyerOrdersViewAllLink totalCount={buyerOrders.length} />
        </>
      )}
    </section>
  );
}
