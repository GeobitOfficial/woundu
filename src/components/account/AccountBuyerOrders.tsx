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
    <section className="flex h-full min-h-[18rem] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <ShoppingBag aria-hidden className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-950">Mis compras</h2>
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
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-slate-200/80">
              <PackageOpen aria-hidden className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-900">
              Aún no tienes compras
            </p>
            <p className="mt-1 max-w-[16rem] text-xs leading-5 text-slate-500">
              Encuentra productos de vendedores en toda Latinoamérica.
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-hover"
              href="/marketplace"
            >
              Ir al marketplace
              <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
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
