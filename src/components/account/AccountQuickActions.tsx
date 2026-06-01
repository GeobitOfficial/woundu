"use client";

import Link from "next/link";
import {
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
  accent?: boolean;
}>;

const ACTIONS: ReadonlyArray<QuickAction> = [
  {
    href: "/publicar",
    label: "Publicar",
    description: "Sube un producto nuevo",
    icon: Package,
    accent: true,
  },
  {
    href: "/cuenta/ventas",
    label: "Mis ganancias",
    description: "Ventas y reportes",
    icon: TrendingUp,
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

export function AccountQuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {ACTIONS.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            className={cn(
              "group rounded-[1.5rem] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
              action.accent
                ? "border-brand/30 bg-gradient-to-br from-brand to-brand-dark text-white shadow-brand/20 hover:shadow-brand/30"
                : "border-slate-200/80 bg-white/95 text-slate-950 hover:border-brand/25 hover:bg-brand-light/20",
            )}
            href={action.href}
            key={action.href}
          >
            <div
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                action.accent
                  ? "bg-white/15 text-white"
                  : "bg-brand-light text-brand-dark",
              )}
            >
              <Icon aria-hidden className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-black">{action.label}</p>
            <p
              className={cn(
                "mt-1 text-xs leading-5",
                action.accent ? "text-white/80" : "text-slate-500",
              )}
            >
              {action.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
