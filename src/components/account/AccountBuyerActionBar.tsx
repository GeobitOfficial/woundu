import Link from "next/link";
import {
  Bell,
  Heart,
  LifeBuoy,
  Package,
  Search,
  Star,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type AccountBuyerActionBarProps = Readonly<{
  favoritesCount: number;
  ordersCount: number;
  pendingReviewsCount: number;
  unreadNotificationCount?: number;
}>;

type StatChip = Readonly<{
  icon: LucideIcon;
  label: string;
  value: number;
  tone: string;
}>;

type NavChip = Readonly<{
  href: string;
  icon: LucideIcon;
  label: string;
  featured?: boolean;
}>;

const NAV_CHIPS: ReadonlyArray<NavChip> = [
  { href: "/marketplace", icon: Search, label: "Marketplace", featured: true },
  { href: "/cuenta/notificaciones", icon: Bell, label: "Notificaciones" },
  { href: "/cuenta/soporte", icon: LifeBuoy, label: "Soporte" },
];

export function AccountBuyerActionBar({
  favoritesCount,
  ordersCount,
  pendingReviewsCount,
  unreadNotificationCount = 0,
}: AccountBuyerActionBarProps) {
  const stats: ReadonlyArray<StatChip> = [
    {
      icon: Package,
      label: "Pedidos",
      value: ordersCount,
      tone: "text-brand-dark bg-gradient-to-br from-brand/12 to-brand-light/20 ring-brand/30",
    },
    {
      icon: Heart,
      label: "Favoritos",
      value: favoritesCount,
      tone: "text-rose-700 bg-gradient-to-br from-rose-50 to-rose-100/40 ring-rose-200/60",
    },
    {
      icon: Star,
      label: "Reseñas",
      value: pendingReviewsCount,
      tone: "text-amber-800 bg-gradient-to-br from-amber-50 to-amber-100/40 ring-amber-200/60",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto lg:flex lg:flex-wrap">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className={cn(
                  "inline-flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition hover:shadow-md",
                  stat.tone,
                )}
                key={stat.label}
              >
                <Icon aria-hidden className="h-5 w-5 shrink-0 opacity-90" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-2xl font-black tabular-nums leading-none">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold opacity-75">
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <nav
          aria-label="Accesos rápidos"
          className="flex flex-wrap gap-2.5 border-t border-slate-100/80 pt-5 lg:border-t-0 lg:pt-0"
        >
          {NAV_CHIPS.map((item) => {
            const Icon = item.icon;
            const showBadge =
              item.href === "/cuenta/notificaciones" && unreadNotificationCount > 0;

            return (
              <Link
                aria-label={
                  showBadge
                    ? `${item.label}, ${unreadNotificationCount} sin leer`
                    : item.label
                }
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5",
                  item.featured
                    ? "bg-gradient-to-r from-brand to-brand-hover text-white shadow-md shadow-brand/30 hover:shadow-lg"
                    : "bg-slate-100/60 text-slate-700 ring-1 ring-slate-200/80 hover:bg-brand-light/50 hover:text-brand-dark hover:ring-brand/30",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
                {showBadge ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
