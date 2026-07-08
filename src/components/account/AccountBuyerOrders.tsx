import Link from "next/link";
import { ArrowUpRight, PackageOpen, ShoppingBag } from "lucide-react";

import { AccountBuyerOrderListItem } from "@/components/account/AccountBuyerOrderListItem";
import { AccountBuyerOrdersViewAllLink } from "@/components/account/AccountBuyerOrdersViewAllLink";
import { ACCOUNT_BUYER_ORDERS_PREVIEW_COUNT } from "@/features/account/orderConstants";
import type { BuyerOrderView } from "@/features/account/types";

type AccountBuyerOrdersProps = Readonly<{
  buyerOrders: ReadonlyArray<BuyerOrderView>;
}>;

export function AccountBuyerOrders({ buyerOrders }: AccountBuyerOrdersProps) {
  const previewOrders = buyerOrders.slice(0, ACCOUNT_BUYER_ORDERS_PREVIEW_COUNT);

  return (
    <section className="flex h-full min-h-[18rem] flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 px-6 py-5">
        <div className="flex items-center gap-3.5">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-md">
            <ShoppingBag aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">Mis compras</h2>
            <p className="text-xs text-slate-500">Historial de pedidos</p>
          </div>
        </div>
        {buyerOrders.length > 0 ? (
          <Link
            aria-label={`Ver todas las compras (${buyerOrders.length})`}
            className="rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-bold text-brand-dark transition hover:bg-brand-light/80"
            href="/cuenta/compras"
          >
            {buyerOrders.length}
          </Link>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {buyerOrders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-light to-brand/10 text-brand shadow-md">
              <PackageOpen aria-hidden className="h-7 w-7" />
            </div>
            <p className="mt-5 text-base font-bold text-slate-950">
              Aún no tienes compras
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
              Comienza a explorar productos de vendedores en toda Latinoamérica.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-hover px-5 py-2.5 text-sm font-bold text-white transition hover:shadow-md hover:shadow-brand/30"
              href="/marketplace"
            >
              Ir al marketplace
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-2.5">
              {previewOrders.map((order) => (
                <AccountBuyerOrderListItem key={order.id} order={order} />
              ))}
            </ul>
            <AccountBuyerOrdersViewAllLink totalCount={buyerOrders.length} />
          </>
        )}
      </div>
    </section>
  );
}
