import Link from "next/link";
import { Heart } from "lucide-react";

import type { AccountFavoriteProductView } from "@/features/account/types";
import { formatAccountDate } from "@/lib/account/orderStatusUi";
import { formatMoney } from "@/lib/currency/formatMoney";
import { toMarketplaceHref } from "@/lib/marketplaceFilters";

type AccountFavoritesSectionProps = Readonly<{
  favoriteProducts: ReadonlyArray<AccountFavoriteProductView>;
}>;

export function AccountFavoritesSection({
  favoriteProducts,
}: AccountFavoritesSectionProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
      <div className="flex items-center gap-2">
        <Heart aria-hidden className="h-5 w-5 text-rose-500" />
        <h2 className="text-lg font-black text-slate-950">Mis favoritos</h2>
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
        <ul className="mt-5 grid gap-3">
        {favoriteProducts.map((item) => (
          <li key={item.productId}>
            <Link
              className="block rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 transition hover:border-rose-200 hover:bg-rose-50/50"
              href={toMarketplaceHref({ search: item.title })}
            >
              <p className="font-semibold text-slate-950 line-clamp-2">
                {item.title}
              </p>
              <p className="mt-1 text-sm font-bold text-brand-dark">
                {formatMoney(item.price, item.currency)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Guardado el {formatAccountDate(item.favoritedAt)}
              </p>
            </Link>
          </li>
        ))}
        </ul>
      )}
    </section>
  );
}
