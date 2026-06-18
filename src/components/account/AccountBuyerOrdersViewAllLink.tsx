import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ACCOUNT_BUYER_ORDERS_PREVIEW_COUNT } from "@/features/account/orderConstants";

type AccountBuyerOrdersViewAllLinkProps = Readonly<{
  totalCount: number;
}>;

export function AccountBuyerOrdersViewAllLink({
  totalCount,
}: AccountBuyerOrdersViewAllLinkProps) {
  if (totalCount === 0) {
    return null;
  }

  const hiddenCount = Math.max(0, totalCount - ACCOUNT_BUYER_ORDERS_PREVIEW_COUNT);

  return (
    <Link
      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand/15 bg-brand-light/50 px-3 py-2.5 text-xs font-bold text-brand-dark transition hover:border-brand/30 hover:bg-brand-light"
      href="/cuenta/compras"
    >
      Ver todas las compras
      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black tabular-nums">
        {totalCount}
      </span>
      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
      {hiddenCount > 0 ? (
        <span className="sr-only">
          , incluyendo {hiddenCount} mas no mostradas aqui
        </span>
      ) : null}
    </Link>
  );
}
