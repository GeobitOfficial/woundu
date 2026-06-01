import Link from "next/link";
import { Store, TrendingUp } from "lucide-react";

import { SellerProductsList } from "@/components/account/SellerProductsList";
import type {
  AccountDashboardSnapshot,
  SellerOrderLineView,
} from "@/features/account/types";
import type { SellerProductListItem } from "@/features/products/services/sellerProductService";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  formatAccountDate,
} from "@/lib/account/orderStatusUi";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";

type AccountSellerSectionProps = Readonly<{
  productStats: AccountDashboardSnapshot["productStats"];
  sellerProducts: ReadonlyArray<SellerProductListItem>;
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
  sellerProducts,
  sellerLines,
  sellerSalesTotals,
}: AccountSellerSectionProps) {
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

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <h3 className="text-base font-black text-slate-950">Mis publicaciones</h3>
        <p className="mt-1 text-sm text-slate-600">
          Cada producto mantiene su pais y moneda. Editalo si cambia el mercado
          donde lo ofreces.
        </p>
        <SellerProductsList products={sellerProducts} />
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

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <h3 className="text-base font-black text-slate-950">
          Ventas recientes
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Productos tuyos incluidos en pedidos de compradores.
        </p>

        {sellerLines.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
            Sin ventas registradas.{" "}
            <Link className="font-bold text-brand underline" href="/publicar">
              Publica tu primer producto
            </Link>
            .
          </div>
        ) : (
          <ul className="mt-5 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
            {sellerLines.slice(0, 8).map((line) => (
              <li
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm"
                key={line.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">
                    {line.productTitle}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      ORDER_STATUS_STYLE[line.orderStatus],
                    )}
                  >
                    {ORDER_STATUS_LABEL[line.orderStatus]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
                  <span>Pedido {line.orderId.slice(0, 8)}…</span>
                  <span>{formatAccountDate(line.orderCreatedAt)}</span>
                </div>
                <p className="mt-2 font-bold text-slate-950">
                  {formatMoney(line.lineTotal, line.currency)} · x{line.quantity}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
