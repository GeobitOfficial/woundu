import Link from "next/link";
import { Heart } from "lucide-react";

import { AccountFavoriteListItem } from "@/components/account/AccountFavoriteListItem";
import { AccountFavoritesViewAllLink } from "@/components/account/AccountFavoritesViewAllLink";
import { ACCOUNT_FAVORITES_PREVIEW_COUNT } from "@/features/account/favoriteConstants";
import type { AccountFavoriteProductView } from "@/features/account/types";

type AccountFavoritesSectionProps = Readonly<{
  favoriteProducts: ReadonlyArray<AccountFavoriteProductView>;
}>;

export function AccountFavoritesSection({
  favoriteProducts,
}: AccountFavoritesSectionProps) {
  const previewItems = favoriteProducts.slice(0, ACCOUNT_FAVORITES_PREVIEW_COUNT);
  const hasMore = favoriteProducts.length > ACCOUNT_FAVORITES_PREVIEW_COUNT;

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heart aria-hidden className="h-5 w-5 text-rose-500" />
          <h2 className="text-lg font-black text-slate-950">Mis favoritos</h2>
        </div>
        {favoriteProducts.length > 0 && hasMore ? (
          <Link
            className="text-xs font-bold text-brand hover:underline"
            href="/cuenta/favoritos"
          >
            Ver todos
          </Link>
        ) : null}
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 px-4 py-10 text-center text-sm text-slate-600">
          Aun no guardaste productos. Explora el{" "}
          <Link className="font-bold text-brand underline" href="/marketplace">
            marketplace
          </Link>{" "}
          y marca tus favoritos.
        </div>
      ) : (
        <>
          <ul className="mt-5 grid gap-3">
            {previewItems.map((item) => (
              <AccountFavoriteListItem item={item} key={item.productId} variant="detailed" />
            ))}
          </ul>
          <AccountFavoritesViewAllLink totalCount={favoriteProducts.length} />
        </>
      )}
    </section>
  );
}
