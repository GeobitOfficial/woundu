import Link from "next/link";

import type { SellerSalesTab } from "@/features/account/sellerSalesConstants";
import type { SellerSalesCounts } from "@/services/supabase/account/sellerSalesAccountService";
import { cn } from "@/lib/utils";

type SellerSalesTabNavProps = Readonly<{
  activeTab: SellerSalesTab;
  counts: SellerSalesCounts;
}>;

const TABS: ReadonlyArray<{
  id: SellerSalesTab;
  label: string;
  description: string;
}> = [
  {
    id: "pendientes",
    label: "Pendientes",
    description: "Por confirmar o gestionar",
  },
  {
    id: "finalizadas",
    label: "Finalizadas",
    description: "Completadas, canceladas o reembolsadas",
  },
];

export function SellerSalesTabNav({ activeTab, counts }: SellerSalesTabNavProps) {
  return (
    <nav
      aria-label="Filtrar ventas por estado"
      className="grid gap-2 sm:grid-cols-2"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const count = tab.id === "pendientes" ? counts.pendientes : counts.finalizadas;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-2xl border px-4 py-3 transition",
              isActive
                ? "border-brand bg-brand-light/50 shadow-sm"
                : "border-slate-200 bg-white hover:border-brand/30 hover:bg-slate-50",
            )}
            href={`/cuenta/mis-ventas?tab=${tab.id}`}
            key={tab.id}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black text-slate-950">{tab.label}</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
                  isActive
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {count}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{tab.description}</p>
          </Link>
        );
      })}
    </nav>
  );
}
