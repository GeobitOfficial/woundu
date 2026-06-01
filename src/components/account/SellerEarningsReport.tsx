import Link from "next/link";
import { ArrowLeft, BarChart3, Package, ShoppingCart, TrendingUp } from "lucide-react";

import { formatCurrencyLabel } from "@/constants/countryCurrencies";
import { buttonVariants } from "@/components/ui";
import type { SellerEarningsSnapshot } from "@/features/account/types";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  processing: "En proceso",
  completed: "Completado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-brand-muted text-brand-dark",
  paid: "bg-brand-muted text-brand-dark",
  processing: "bg-indigo-100 text-indigo-900",
  completed: "bg-brand-muted text-brand-dark",
  cancelled: "bg-slate-200 text-slate-800",
  refunded: "bg-violet-100 text-violet-900",
};

function formatDate(iso: string): string {
  if (!iso) {
    return "—";
  }
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

type SellerEarningsReportProps = Readonly<{
  snapshot: SellerEarningsSnapshot;
}>;

export function SellerEarningsReport({ snapshot }: SellerEarningsReportProps) {
  const { totals, lines, monthlyBreakdown } = snapshot;
  const grossEarned = totals.completedAmount + totals.inProgressAmount;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-violet-100/80 bg-gradient-to-br from-violet-50/80 via-white to-brand-light/40 p-6 shadow-lg shadow-brand/10 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              {snapshot.rangeLabel}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {formatMoney(totals.completedAmount, totals.currency)}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Ganancias confirmadas en{" "}
              <span className="font-semibold text-slate-800">
                {formatCurrencyLabel(snapshot.sellerCurrency)}
              </span>
              .
            </p>
            {snapshot.excludedOtherCurrencyCount > 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                {snapshot.excludedOtherCurrencyCount} linea(s) en otra moneda no
                se incluyen en este total.
              </p>
            ) : null}
          </div>
          <Link
            className={cn(buttonVariants({ size: "md", variant: "secondary" }))}
            href="/cuenta"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Volver a mi cuenta
          </Link>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-brand/20 bg-white/90 p-4">
            <dt className="flex items-center gap-2 text-xs font-bold uppercase text-brand-dark">
              <TrendingUp aria-hidden className="h-4 w-4" />
              Confirmado
            </dt>
            <dd className="mt-2 text-xl font-black text-brand-dark">
              {formatMoney(totals.completedAmount, totals.currency)}
            </dd>
          </div>
          <div className="rounded-2xl border border-brand/20 bg-white/90 p-4">
            <dt className="flex items-center gap-2 text-xs font-bold uppercase text-brand-dark">
              <BarChart3 aria-hidden className="h-4 w-4" />
              En curso
            </dt>
            <dd className="mt-2 text-xl font-black text-brand-dark">
              {formatMoney(totals.inProgressAmount, totals.currency)}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <dt className="flex items-center gap-2 text-xs font-bold uppercase text-slate-600">
              <ShoppingCart aria-hidden className="h-4 w-4" />
              Pedidos
            </dt>
            <dd className="mt-2 text-xl font-black text-slate-950">
              {snapshot.ordersCount}
              <span className="ml-2 text-sm font-semibold text-slate-500">
                ({snapshot.completedOrdersCount} completados)
              </span>
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <dt className="flex items-center gap-2 text-xs font-bold uppercase text-slate-600">
              <Package aria-hidden className="h-4 w-4" />
              Unidades
            </dt>
            <dd className="mt-2 text-xl font-black text-slate-950">
              {snapshot.unitsSold}
            </dd>
          </div>
        </dl>

        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-600">
          <p>
            Ventas brutas del periodo (confirmadas + en curso):{" "}
            <span className="font-bold text-slate-900">
              {formatMoney(grossEarned, totals.currency)}
            </span>
          </p>
          {(totals.cancelledOrRefundedAmount > 0) ? (
            <p className="mt-1">
              Cancelado o reembolsado:{" "}
              <span className="font-bold text-slate-900">
                {formatMoney(totals.cancelledOrRefundedAmount, totals.currency)}
              </span>
            </p>
          ) : null}
        </div>
      </section>

      {monthlyBreakdown.length > 1 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
          <h3 className="text-base font-black text-slate-950">Desglose por mes</h3>
          <p className="mt-1 text-sm text-slate-600">
            Distribución de tus ganancias dentro del periodo consultado.
          </p>
          <ul className="mt-5 space-y-3">
            {monthlyBreakdown.map((bucket) => {
              const maxAmount = Math.max(
                ...monthlyBreakdown.map((item) => item.completedAmount),
                1,
              );
              const widthPercent = Math.round(
                (bucket.completedAmount / maxAmount) * 100,
              );

              return (
                <li
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  key={bucket.monthKey}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold capitalize text-slate-900">
                      {bucket.monthLabel}
                    </p>
                    <p className="text-sm font-black text-brand-dark">
                      {formatMoney(bucket.completedAmount, totals.currency)}
                    </p>
                  </div>
                  <div
                    aria-hidden
                    className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                  >
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {bucket.ordersCount} pedidos · {bucket.unitsSold} unidades
                    {bucket.inProgressAmount > 0
                      ? ` · ${formatMoney(bucket.inProgressAmount, totals.currency)} en curso`
                      : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <h3 className="text-base font-black text-slate-950">
          Detalle de ventas del periodo
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Cada fila corresponde a un producto tuyo dentro de un pedido.
        </p>

        {lines.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
            No hay ventas registradas en este periodo. Prueba otro rango de fechas
            o publica productos en{" "}
            <Link className="font-bold text-brand underline" href="/publicar">
              Publicar
            </Link>
            .
          </div>
        ) : (
          <ul className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {lines.map((line) => (
              <li
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm"
                key={line.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">
                    {line.productTitle}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      ORDER_STATUS_STYLE[line.orderStatus],
                    )}
                  >
                    {ORDER_STATUS_LABEL[line.orderStatus]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
                  <span>Pedido {line.orderId.slice(0, 8)}…</span>
                  <span>{formatDate(line.orderCreatedAt)}</span>
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
