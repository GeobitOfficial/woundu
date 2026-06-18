import Link from "next/link";
import { Bell, LifeBuoy, Search, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type QuickNavItem = Readonly<{
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
}>;

const NAV_ITEMS: ReadonlyArray<QuickNavItem> = [
  {
    href: "/marketplace",
    label: "Marketplace",
    description: "Descubre productos nuevos",
    icon: Search,
    featured: true,
  },
  {
    href: "/cuenta/notificaciones",
    label: "Notificaciones",
    description: "Avisos de tus pedidos",
    icon: Bell,
  },
  {
    href: "/cuenta/soporte",
    label: "Soporte",
    description: "Ayuda cuando la necesites",
    icon: LifeBuoy,
  },
];

export function AccountBuyerQuickNav() {
  return (
    <nav aria-label="Accesos rápidos de comprador">
      <div className="grid gap-3 sm:grid-cols-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "group relative overflow-hidden rounded-[1.35rem] border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
                item.featured
                  ? "border-brand/25 bg-gradient-to-br from-brand to-brand-dark text-white shadow-lg shadow-brand/20 hover:shadow-brand/30"
                  : "border-slate-200/80 bg-white/95 text-slate-950 hover:border-brand/20 hover:bg-brand-light/20",
              )}
              href={item.href}
              key={item.href}
            >
              {item.featured ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"
                />
              ) : null}

              <div
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition",
                  item.featured
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-700 group-hover:bg-brand-light group-hover:text-brand-dark",
                )}
              >
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <p className="relative mt-4 text-sm font-black">{item.label}</p>
              <p
                className={cn(
                  "relative mt-1 text-xs leading-5",
                  item.featured ? "text-white/80" : "text-slate-500",
                )}
              >
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
