import Link from "next/link";
import { Store, TrendingUp } from "lucide-react";

import { SellerPayoutForm } from "@/components/account/SellerPayoutForm";
import { SellerSalesListItem } from "@/components/account/SellerSalesListItem";
import type { AccountDashboardSnapshot } from "@/features/account/types";
import { SELLER_SALES_PREVIEW_COUNT } from "@/features/account/sellerSalesConstants";
import type { SellerPayoutProfile } from "@/features/orders/types";
import type { SellerOrderLineView } from "@/features/account/types";
import type { SellerSalesCounts } from "@/services/supabase/account/sellerSalesAccountService";
import {
  isSellerFinalizedOrderStatus,
  isSellerPendingOrderStatus,
} from "@/lib/account/sellerSalesGroups";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";

type AccountSellerSectionProps = Readonly<{
  productStats: AccountDashboardSnapshot["productStats"];
  sellerPayout: SellerPayoutProfile | null;
  sellerSalesCounts: SellerSalesCounts;
  sellerSalesTotals: AccountDashboardSnapshot["sellerSalesTotals"];
  sellerLines: ReadonlyArray<SellerOrderLineView>;
  currentMonthEarnings: Readonly<{
    rangeLabel: string;
    totals: AccountDashboardSnapshot["sellerSalesTotals"];
  }>;
}>;

export function AccountSellerSection({
  currentMonthEarnings,
  productStats,
  sellerPayout,
  sellerLines,
  sellerSalesCounts,
  sellerSalesTotals,
}: AccountSellerSectionProps) {
  const pendingSales = sellerLines.filter((line) =>
    isSellerPendingOrderStatus(line.orderStatus),
  );
  const finalizedSales = sellerLines.filter((line) =>
    isSellerFinalizedOrderStatus(line.orderStatus),
  );
  const pendingPreview = pendingSales.slice(0, SELLER_SALES_PREVIEW_COUNT);
  const finalizedPreview = finalizedSales.slice(0, SELLER_SALES_PREVIEW_COUNT);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-brand/20 bg-white/95 p-6 shadow-lg shadow-brand/10 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store aria-hidden className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-black text-slate-950">Panel vendedor</h2>
          </div>
          <Link
            className="text-sm font-bold text-brand underline-offset-2 hover:underline"
            href="/publicar"
          >
            Publicar producto
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Activos", value: productStats.active, accent: true },
            { label: "Borradores", value: productStats.draft },
            { label: "Pausados", value: productStats.paused },
            { label: "Vendidos", value: productStats.sold, accent: true },
          ].map((stat) => (
            <div
              className={cn(
                "rounded-2xl border p-4",
                stat.accent
                  ? "border-brand/20 bg-brand-light/60"
                  : "border-slate-200 bg-slate-50/80",
              )}
              key={stat.label}
            >
              <p
                className={cn(
                  "text-xs font-bold uppercase",
                  stat.accent ? "text-brand-dark" : "text-slate-600",
                )}
              >
                {stat.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-black",
                  stat.accent ? "text-brand-dark" : "text-slate-950",
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-violet-100/80 bg-gradient-to-br from-violet-50/80 via-white to-brand-light/30 p-6 shadow-lg shadow-brand/10 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp aria-hidden className="h-5 w-5 text-violet-600" />
              <h3 className="text-base font-black text-slate-950">
                Ganancias del mes
              </h3>
            </div>
            <p className="mt-1 text-sm capitalize text-slate-600">
              {currentMonthEarnings.rangeLabel}
            </p>
          </div>
          <Link
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-brand shadow-sm ring-1 ring-brand/20 transition hover:bg-brand-light"
            href="/cuenta/ventas"
          >
            Ver reporte
          </Link>
        </div>

        <p className="mt-5 text-4xl font-black tracking-tight text-brand-dark">
          {formatMoney(
            currentMonthEarnings.totals.completedAmount,
            currentMonthEarnings.totals.currency,
          )}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {formatMoney(
            currentMonthEarnings.totals.inProgressAmount,
            currentMonthEarnings.totals.currency,
          )}{" "}
          en curso
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Completado",
              value: sellerSalesTotals.completedAmount,
            },
            {
              label: "En curso",
              value: sellerSalesTotals.inProgressAmount,
            },
            {
              label: "Cancelado",
              value: sellerSalesTotals.cancelledOrRefundedAmount,
            },
          ].map((item) => (
            <div
              className="rounded-xl border border-white/80 bg-white/70 px-3 py-3"
              key={item.label}
            >
              <dt className="text-xs font-bold uppercase text-slate-500">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-black text-slate-950">
                {formatMoney(item.value, sellerSalesTotals.currency)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <SellerPayoutForm initialPayout={sellerPayout} />

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-950">Mis ventas</h3>
            <p className="mt-1 text-sm text-slate-600">
              Pedidos pendientes por confirmar y ventas ya finalizadas.
            </p>
          </div>
          <Link
            className="rounded-full border border-brand/25 bg-brand-light/40 px-4 py-2 text-sm font-bold text-brand-dark transition hover:bg-brand-light"
            href="/cuenta/mis-ventas"
          >
            Ver todas
          </Link>
        </div>

        {sellerSalesCounts.pendientes === 0 &&
        sellerSalesCounts.finalizadas === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
            Sin ventas registradas.{" "}
            <Link className="font-bold text-brand underline" href="/publicar">
              Publica tu primer producto
            </Link>
            .
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-950">
                  Pendientes por confirmar
                </h4>
                {sellerSalesCounts.pendientes > 0 ? (
                  <Link
                    className="text-xs font-bold text-brand hover:underline"
                    href="/cuenta/mis-ventas?tab=pendientes"
                  >
                    Ver todas ({sellerSalesCounts.pendientes})
                  </Link>
                ) : null}
              </div>

              {pendingPreview.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-600">
                  No tienes ventas pendientes en este momento.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {pendingPreview.map((line) => (
                    <SellerSalesListItem key={line.id} line={line} />
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-100 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-950">Finalizadas</h4>
                {sellerSalesCounts.finalizadas > 0 ? (
                  <Link
                    className="text-xs font-bold text-brand hover:underline"
                    href="/cuenta/mis-ventas?tab=finalizadas"
                  >
                    Ver todas ({sellerSalesCounts.finalizadas})
                  </Link>
                ) : null}
              </div>

              {finalizedPreview.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-600">
                  Aun no tienes ventas finalizadas.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {finalizedPreview.map((line) => (
                    <SellerSalesListItem key={line.id} line={line} showAction={false} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
