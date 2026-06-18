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
      tone: "text-brand-dark bg-brand-light/70 ring-brand/10",
    },
    {
      icon: Heart,
      label: "Favoritos",
      value: favoritesCount,
      tone: "text-rose-700 bg-rose-50 ring-rose-100",
    },
    {
      icon: Star,
      label: "Reseñas",
      value: pendingReviewsCount,
      tone: "text-amber-800 bg-amber-50 ring-amber-100",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 ring-1",
                  stat.tone,
                )}
                key={stat.label}
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0 opacity-80" />
                <span className="text-lg font-black tabular-nums leading-none">
                  {stat.value}
                </span>
                <span className="text-xs font-semibold opacity-80">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>

        <nav
          aria-label="Accesos rápidos"
          className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0"
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
                  "relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition hover:-translate-y-px",
                  item.featured
                    ? "bg-brand text-white shadow-sm shadow-brand/20 hover:bg-brand-hover"
                    : "bg-slate-50 text-slate-700 ring-1 ring-slate-200/80 hover:bg-brand-light/40 hover:text-brand-dark",
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
