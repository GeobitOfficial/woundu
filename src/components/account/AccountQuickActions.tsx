"use client";

import Link from "next/link";
import {
  Bell,
  Layers,
  LifeBuoy,
  Package,
  ShoppingBag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type QuickAction = Readonly<{
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
  badgeCount?: number;
}>;

const SELLER_ONLY_HREFS = new Set([
  "/publicar",
  "/cuenta/publicaciones",
  "/cuenta/ventas",
]);

const ACTIONS: ReadonlyArray<Omit<QuickAction, "badgeCount">> = [
  {
    href: "/publicar",
    label: "Publicar",
    description: "Sube un producto nuevo",
    icon: Package,
    featured: true,
  },
  {
    href: "/cuenta/publicaciones",
    label: "Mis publicaciones",
    description: "Catalogo por categoria",
    icon: Layers,
  },
  {
    href: "/cuenta/ventas",
    label: "Mis ganancias",
    description: "Ventas y reportes",
    icon: TrendingUp,
  },
  {
    href: "/cuenta/notificaciones",
    label: "Notificaciones",
    description: "Pedidos y avisos",
    icon: Bell,
  },
  {
    href: "/cuenta/soporte",
    label: "Soporte",
    description: "Tickets de ayuda",
    icon: LifeBuoy,
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    description: "Explorar productos",
    icon: ShoppingBag,
  },
];

type AccountQuickActionsProps = Readonly<{
  showSellerActions?: boolean;
  unreadNotificationCount?: number;
}>;

export function AccountQuickActions({
  showSellerActions = false,
  unreadNotificationCount = 0,
}: AccountQuickActionsProps) {
  const actions = ACTIONS.filter(
    (action) => showSellerActions || !SELLER_ONLY_HREFS.has(action.href),
  ).map((action) => ({
    ...action,
    badgeCount:
      action.href === "/cuenta/notificaciones" ? unreadNotificationCount : 0,
  }));

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
      <nav
        aria-label="Accesos rápidos de tu cuenta"
        className="flex flex-wrap gap-2"
      >
        {actions.map((action) => {
          const Icon = action.icon;
          const showBadge = (action.badgeCount ?? 0) > 0;

          return (
            <Link
              aria-label={
                showBadge
                  ? `${action.label}, ${action.badgeCount} sin leer`
                  : action.label
              }
              className={cn(
                "relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition hover:-translate-y-px",
                action.featured
                  ? "bg-brand text-white shadow-sm shadow-brand/20 hover:bg-brand-hover"
                  : "bg-slate-50 text-slate-700 ring-1 ring-slate-200/80 hover:bg-brand-light/40 hover:text-brand-dark",
              )}
              href={action.href}
              key={action.href}
              title={action.description}
            >
              <Icon aria-hidden className="h-4 w-4 shrink-0" />
              {action.label}
              {showBadge ? (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black",
                    action.featured
                      ? "bg-white text-red-600"
                      : "bg-red-500 text-white",
                  )}
                >
                  {(action.badgeCount ?? 0) > 9 ? "9+" : action.badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
