import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";

import type { AccountFavoriteProductView } from "@/features/account/types";
import { formatAccountDate } from "@/lib/account/orderStatusUi";
import { getFavoriteProductHref } from "@/lib/account/favoriteProductLinks";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";

type AccountFavoriteListItemProps = Readonly<{
  item: AccountFavoriteProductView;
  variant?: "compact" | "detailed";
}>;

export function AccountFavoriteListItem({
  item,
  variant = "compact",
}: AccountFavoriteListItemProps) {
  const href = getFavoriteProductHref(item);

  if (variant === "detailed") {
    return (
      <li>
        <Link
          className="group block rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-rose-200 hover:bg-rose-50/50"
          href={href}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
              <Heart aria-hidden className="h-4 w-4 fill-current" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-950 line-clamp-2">{item.title}</p>
              <p className="mt-1 text-sm font-bold text-brand-dark">
                {formatMoney(item.price, item.currency)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Guardado el {formatAccountDate(item.favoritedAt)}
              </p>
            </div>
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand"
            />
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        className={cn(
          "group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 transition hover:border-rose-200 hover:bg-rose-50/50",
        )}
        href={href}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-500">
          <Heart aria-hidden className="h-4 w-4 fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
          <p className="text-xs font-black text-brand-dark">
            {formatMoney(item.price, item.currency)}
          </p>
        </div>
        <ArrowUpRight
          aria-hidden
          className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand"
        />
      </Link>
    </li>
  );
}
