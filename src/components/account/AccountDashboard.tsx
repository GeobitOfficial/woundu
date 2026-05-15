import Link from "next/link";
import { Heart, Package, ShoppingBag, Store, TrendingUp } from "lucide-react";

import { ProfileEditForm } from "@/components/account/ProfileEditForm";
import { buttonVariants } from "@/components/ui";
import type { AccountDashboardSnapshot } from "@/features/account/types";
import type { OrderStatus } from "@/types";
import { toMarketplaceHref } from "@/lib/marketplaceFilters";
import { cn } from "@/lib/utils";

import { AccountSignOutButton } from "./AccountSignOutButton";

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  processing: "En proceso",
  completed: "Completado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  paid: "bg-sky-100 text-sky-900",
  processing: "bg-indigo-100 text-indigo-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-slate-200 text-slate-800",
  refunded: "bg-violet-100 text-violet-900",
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  if (!iso) {
    return "—";
  }
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

type AccountDashboardProps = Readonly<{
  email: string;
  authFullName: string | null;
  snapshot: AccountDashboardSnapshot;
}>;

export function AccountDashboard({
  authFullName,
  email,
  snapshot,
}: AccountDashboardProps) {
  const { profile, buyerOrders, sellerLines, productStats, sellerSalesTotals, favoriteProducts } =
    snapshot;
  const displayName = profile?.fullName ?? authFullName ?? "Usuario";
  const roleLabel =
    profile?.role === "seller"
      ? "Vendedor"
      : profile?.role === "admin"
        ? "Administrador"
        : "Comprador";

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Tu cuenta
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Hola, {displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-emerald-100">
                Rol: {roleLabel}
              </span>
              {profile ? (
                <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-amber-100">
                  Reputacion {profile.reputationScore.toFixed(1)} ·{" "}
                  {profile.reviewsCount} reseñas
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className={cn(buttonVariants({ size: "md", variant: "secondary" }))}
              href="/marketplace"
            >
              <ShoppingBag aria-hidden className="h-4 w-4" />
              Marketplace
            </Link>
            <Link
              className={cn(buttonVariants({ size: "md", variant: "primary" }))}
              href="/publicar"
            >
              <Package aria-hidden className="h-4 w-4" />
              Publicar
            </Link>
            <AccountSignOutButton />
          </div>
        </div>

        <section className="rounded-[2rem] border border-emerald-100/70 bg-white/95 p-6 shadow-lg shadow-emerald-900/10 backdrop-blur-sm sm:p-8">
          <h2 className="text-lg font-black text-slate-950">Perfil en Woundu</h2>
          {profile ? (
            <ProfileEditForm
              key={`${profile.fullName}|${profile.username ?? ""}|${profile.bio ?? ""}`}
              initialBio={profile.bio ?? ""}
              initialFullName={profile.fullName}
              initialUsername={profile.username ?? ""}
            />
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              No encontramos tu perfil en la base de datos. Si acabas de
              registrarte, recarga en unos segundos o contacta soporte.
            </p>
          )}
        </section>

        {favoriteProducts.length > 0 ? (
          <section className="rounded-[2rem] border border-rose-100/70 bg-white/95 p-6 shadow-lg shadow-rose-900/10 backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-2">
              <Heart aria-hidden className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-black text-slate-950">Mis favoritos</h2>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {favoriteProducts.map((item) => (
                <li key={item.productId}>
                  <Link
                    className="block rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                    href={toMarketplaceHref({ search: item.title })}
                  >
                    <p className="font-semibold text-slate-950 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-800">
                      {formatMoney(item.price, item.currency)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Guardado el {formatDate(item.favoritedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-sky-100/80 bg-white/95 p-6 shadow-lg shadow-sky-900/10 backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-2">
              <ShoppingBag
                aria-hidden
                className="h-5 w-5 text-sky-600"
              />
              <h2 className="text-lg font-black text-slate-950">Mis compras</h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Pedidos donde eres comprador. El checkout completo llegara en una
              fase posterior; aqui ves el historial segun datos en Supabase.
            </p>
            {buyerOrders.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 px-4 py-8 text-center text-sm text-slate-600">
                Aun no tienes pedidos. Explora el{" "}
                <Link className="font-bold text-emerald-700 underline" href="/marketplace">
                  marketplace
                </Link>{" "}
                para encontrar productos.
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {buyerOrders.map((order) => (
                  <li
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                    key={order.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-mono text-slate-500">
                        {order.id.slice(0, 8)}…
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-bold",
                          ORDER_STATUS_STYLE[order.status],
                        )}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-black text-slate-950">
                      {formatMoney(order.total, order.currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </p>
                    <ul className="mt-3 space-y-1 border-t border-slate-200/80 pt-3 text-sm text-slate-700">
                      {order.items.map((item) => (
                        <li className="flex justify-between gap-2" key={item.id}>
                          <span>
                            {item.productTitle}{" "}
                            <span className="text-slate-500">
                              x{item.quantity}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium">
                            {formatMoney(item.totalPrice, order.currency)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-emerald-100/80 bg-white/95 p-6 shadow-lg shadow-emerald-900/10 backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-2">
                <Store aria-hidden className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-950">
                  Panel vendedor
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Resumen de publicaciones y montos por lineas de pedido donde
                apareces como vendedor.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-xs font-bold uppercase text-emerald-800">
                    Activos
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-950">
                    {productStats.active}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-600">
                    Borradores
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {productStats.draft}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-600">
                    Pausados
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {productStats.paused}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-xs font-bold uppercase text-amber-900">
                    Vendidos
                  </p>
                  <p className="mt-1 text-2xl font-black text-amber-950">
                    {productStats.sold}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-violet-100/80 bg-white/95 p-6 shadow-lg shadow-violet-900/10 backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-2">
                <TrendingUp aria-hidden className="h-5 w-5 text-violet-600" />
                <h3 className="text-base font-black text-slate-950">
                  Balance por estado (tus lineas)
                </h3>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <dt className="text-xs font-bold text-emerald-800">
                    Completado
                  </dt>
                  <dd className="mt-1 text-sm font-black text-emerald-950">
                    {formatMoney(
                      sellerSalesTotals.completedAmount,
                      sellerSalesTotals.currency,
                    )}
                  </dd>
                </div>
                <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
                  <dt className="text-xs font-bold text-sky-900">En curso</dt>
                  <dd className="mt-1 text-sm font-black text-sky-950">
                    {formatMoney(
                      sellerSalesTotals.inProgressAmount,
                      sellerSalesTotals.currency,
                    )}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <dt className="text-xs font-bold text-slate-600">
                    Cancelado / reembolso
                  </dt>
                  <dd className="mt-1 text-sm font-black text-slate-900">
                    {formatMoney(
                      sellerSalesTotals.cancelledOrRefundedAmount,
                      sellerSalesTotals.currency,
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-sm sm:p-8">
              <h3 className="text-base font-black text-slate-950">
                Lineas de venta recientes
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Cada fila es un producto tuyo dentro de un pedido de un comprador.
              </p>
              {sellerLines.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
                  Sin ventas registradas. Publica en{" "}
                  <Link className="font-bold text-emerald-700 underline" href="/publicar">
                    Publicar
                  </Link>{" "}
                  para empezar.
                </div>
              ) : (
                <ul className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                  {sellerLines.map((line) => (
                    <li
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm"
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
                        <span>{formatDate(line.orderCreatedAt)}</span>
                      </div>
                      <p className="mt-2 font-bold text-slate-950">
                        {formatMoney(line.lineTotal, line.currency)} · x
                        {line.quantity}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
