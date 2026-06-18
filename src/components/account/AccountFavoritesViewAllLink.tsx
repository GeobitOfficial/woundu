import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ACCOUNT_FAVORITES_PREVIEW_COUNT } from "@/features/account/favoriteConstants";

type AccountFavoritesViewAllLinkProps = Readonly<{
  totalCount: number;
}>;

export function AccountFavoritesViewAllLink({
  totalCount,
}: AccountFavoritesViewAllLinkProps) {
  if (totalCount <= ACCOUNT_FAVORITES_PREVIEW_COUNT) {
    return null;
  }

  const hiddenCount = totalCount - ACCOUNT_FAVORITES_PREVIEW_COUNT;

  return (
    <Link
      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2.5 text-xs font-bold text-rose-700 transition hover:border-rose-200 hover:bg-rose-50"
      href="/cuenta/favoritos"
    >
      Ver todos los favoritos
      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black tabular-nums">
        {totalCount}
      </span>
      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
      <span className="sr-only">
        , incluyendo {hiddenCount} mas no mostrados aqui
      </span>
    </Link>
  );
}
