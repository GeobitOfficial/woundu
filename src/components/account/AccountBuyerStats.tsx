import { Heart, Package, Star } from "lucide-react";

import { cn } from "@/lib/utils";

type AccountBuyerStatsProps = Readonly<{
  favoritesCount: number;
  ordersCount: number;
  pendingReviewsCount: number;
}>;

const STAT_ITEMS = [
  {
    key: "orders",
    label: "Pedidos",
    description: "Compras realizadas",
    icon: Package,
    accent: "from-brand/15 to-brand-light/40 text-brand-dark ring-brand/15",
    iconBg: "bg-brand text-white",
  },
  {
    key: "favorites",
    label: "Favoritos",
    description: "Productos guardados",
    icon: Heart,
    accent: "from-rose-50 to-rose-100/50 text-rose-900 ring-rose-100",
    iconBg: "bg-rose-500 text-white",
  },
  {
    key: "reviews",
    label: "Reseñas",
    description: "Pendientes por calificar",
    icon: Star,
    accent: "from-amber-50 to-amber-100/50 text-amber-900 ring-amber-100",
    iconBg: "bg-amber-500 text-white",
  },
] as const;

export function AccountBuyerStats({
  favoritesCount,
  ordersCount,
  pendingReviewsCount,
}: AccountBuyerStatsProps) {
  const values = {
    orders: ordersCount,
    favorites: favoritesCount,
    reviews: pendingReviewsCount,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon;
        const value = values[item.key];

        return (
          <article
            className={cn(
              "relative overflow-hidden rounded-[1.5rem] border bg-gradient-to-br p-5 shadow-sm ring-1",
              item.accent,
            )}
            key={item.key}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
                <p className="mt-1 text-xs leading-5 opacity-75">
                  {item.description}
                </p>
              </div>
              <div
                className={cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                  item.iconBg,
                )}
              >
                <Icon aria-hidden className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
