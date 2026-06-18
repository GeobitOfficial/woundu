import Link from "next/link";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";

import { AccountFavoriteListItem } from "@/components/account/AccountFavoriteListItem";
import { AccountFavoritesViewAllLink } from "@/components/account/AccountFavoritesViewAllLink";
import { ACCOUNT_FAVORITES_PREVIEW_COUNT } from "@/features/account/favoriteConstants";
import type { AccountFavoriteProductView } from "@/features/account/types";

type AccountBuyerFavoritesProps = Readonly<{
  favoriteProducts: ReadonlyArray<AccountFavoriteProductView>;
}>;

export function AccountBuyerFavorites({
  favoriteProducts,
}: AccountBuyerFavoritesProps) {
  const previewItems = favoriteProducts.slice(0, ACCOUNT_FAVORITES_PREVIEW_COUNT);
  const hasMore = favoriteProducts.length > ACCOUNT_FAVORITES_PREVIEW_COUNT;

  return (
    <section className="flex h-full min-h-[18rem] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white">
            <Heart aria-hidden className="h-4 w-4 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-950">Mis favoritos</h2>
            <p className="text-xs text-slate-500">Productos guardados</p>
          </div>
        </div>
        {favoriteProducts.length > 0 ? (
          hasMore ? (
            <Link
              className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100"
              href="/cuenta/favoritos"
            >
              {favoriteProducts.length}
            </Link>
          ) : (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
              {favoriteProducts.length}
            </span>
          )
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {favoriteProducts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-rose-100 bg-rose-50/40 px-4 py-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm ring-1 ring-rose-100">
              <Sparkles aria-hidden className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-900">
              Sin favoritos todavía
            </p>
            <p className="mt-1 max-w-[16rem] text-xs leading-5 text-slate-500">
              Guarda productos mientras exploras el marketplace.
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
              href="/marketplace"
            >
              Descubrir productos
              <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {previewItems.map((item) => (
                <AccountFavoriteListItem item={item} key={item.productId} />
              ))}
            </ul>
            <AccountFavoritesViewAllLink totalCount={favoriteProducts.length} />
          </>
        )}
      </div>
    </section>
  );
}
