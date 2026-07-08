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
    <section className="flex h-full min-h-[18rem] flex-col overflow-hidden rounded-3xl border border-rose-200/40 bg-gradient-to-br from-rose-50/40 to-white backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-rose-100/60 px-6 py-5">
        <div className="flex items-center gap-3.5">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-md">
            <Heart aria-hidden className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">Mis favoritos</h2>
            <p className="text-xs text-slate-500">Productos guardados</p>
          </div>
        </div>
        {favoriteProducts.length > 0 ? (
          hasMore ? (
            <Link
              className="rounded-full bg-rose-100/60 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-200/60 ring-1 ring-rose-200/40"
              href="/cuenta/favoritos"
            >
              {favoriteProducts.length}
            </Link>
          ) : (
            <span className="rounded-full bg-rose-100/60 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200/40">
              {favoriteProducts.length}
            </span>
          )
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {favoriteProducts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200/50 bg-rose-50/30 px-4 py-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-md">
              <Sparkles aria-hidden className="h-7 w-7" />
            </div>
            <p className="mt-5 text-base font-bold text-slate-950">
              Sin favoritos todavía
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
              Guarda productos mientras exploras el marketplace.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-400 to-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:shadow-md hover:shadow-rose-300/30"
              href="/marketplace"
            >
              Descubrir productos
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-2.5">
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
