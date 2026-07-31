import { AccountBuyerActionBar } from "@/components/account/AccountBuyerActionBar";
import { AccountBuyerFavorites } from "@/components/account/AccountBuyerFavorites";
import { AccountBuyerHero } from "@/components/account/AccountBuyerHero";
import { AccountBuyerOrders } from "@/components/account/AccountBuyerOrders";
import { PendingReviewsSection } from "@/components/reviews/PendingReviewsSection";
import { ProductCard } from "@/components/marketplace/ProductCard";
import type { AccountDashboardSnapshot } from "@/features/account/types";
import type { PendingProductReview } from "@/features/reviews/types";
import type { ProductCardItem } from "@/features/products";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, formatAccountDate } from "@/lib/account/orderStatusUi";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type AccountBuyerDashboardProps = Readonly<{
  authFullName: string | null;
  email: string;
  pendingReviews: ReadonlyArray<PendingProductReview>;
  snapshot: AccountDashboardSnapshot;
  unreadNotificationCount?: number;
  suggestedProducts?: ReadonlyArray<ProductCardItem>;
  error?: string | null;
}>;

export function AccountBuyerDashboard({
  authFullName,
  email,
  pendingReviews,
  snapshot,
  unreadNotificationCount = 0,
  suggestedProducts = [],
  error = null,
}: AccountBuyerDashboardProps) {
  const { profile, buyerOrders, favoriteProducts } = snapshot;
  const displayName = profile?.fullName ?? authFullName ?? "Usuario";

  // Find the latest active buyer order
  const activeOrder = buyerOrders.find(
    (o) => o.status === "pending" || o.status === "paid" || o.status === "processing"
  );

  // Set of favorite IDs to pass initialFavorited
  const favIds = new Set(favoriteProducts.map((p) => p.productId));

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-slate-50 pb-12">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
        <AccountBuyerHero
          authFullName={authFullName}
          displayName={displayName}
          email={email}
          profile={profile}
        />

        {error === "solo_vendedores" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900 flex items-start gap-2.5 shadow-sm animate-in fade-in duration-300">
            <span className="text-base">⚠️</span>
            <div>
              <p className="font-bold">Acceso restringido</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Para publicar productos debes configurar tu perfil como vendedor. Si deseas vender, solicita el cambio de rol a soporte.
              </p>
            </div>
          </div>
        )}

        <AccountBuyerActionBar
          favoritesCount={favoriteProducts.length}
          ordersCount={buyerOrders.length}
          pendingReviewsCount={pendingReviews.length}
          unreadNotificationCount={unreadNotificationCount}
        />

        {/* 1. SEGUIMIENTO DE PEDIDO ACTIVO */}
        {activeOrder && (
          <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/5 via-white to-slate-50/60 p-6 shadow-sm animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">Seguimiento de compra</span>
                <h3 className="text-base font-black text-slate-950 mt-1">Sigue tu último pedido activo</h3>
              </div>
              <Link
                href={`/cuenta/pedidos/${activeOrder.id}`}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-brand hover:underline"
              >
                Ver detalles del pedido #{activeOrder.id.slice(0, 8).toUpperCase()}
                <ArrowUpRight className="h-4.5 w-4.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-500">Artículo comprado</p>
                <p className="text-sm font-bold text-slate-900 leading-snug truncate mt-1">
                  {activeOrder.items[0]?.productTitle || "Producto"}
                  {activeOrder.items.length > 1 && ` y ${activeOrder.items.length - 1} más`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Cantidad: {activeOrder.items[0]?.quantity || 1}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">Total de la orden</p>
                <p className="text-sm font-extrabold text-slate-950 mt-1">
                  {formatMoney(activeOrder.total, activeOrder.currency)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fecha: {formatAccountDate(activeOrder.createdAt)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Estado del pedido</p>
                <span className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-black ring-1",
                  ORDER_STATUS_STYLE[activeOrder.status]
                )}>
                  {ORDER_STATUS_LABEL[activeOrder.status]}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100/80">
              <div className="relative flex items-center justify-between">
                {/* Background Line */}
                <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200" />
                
                {/* Active Line */}
                <div
                  className="absolute left-4 top-1/2 h-0.5 -translate-y-1/2 bg-brand transition-all duration-500"
                  style={{
                    width: activeOrder.status === "pending"
                      ? "0%"
                      : activeOrder.status === "paid"
                        ? "50%"
                        : activeOrder.status === "processing"
                          ? "100%"
                          : "0%"
                  }}
                />

                {/* Step 1: Creado */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white font-extrabold text-xs ring-4 ring-white shadow-sm">
                    1
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-slate-800">Pedido Creado</span>
                </div>

                {/* Step 2: Pago Reportado */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full font-extrabold text-xs ring-4 ring-white shadow-sm transition-all duration-300",
                    (activeOrder.status === "paid" || activeOrder.status === "processing" || activeOrder.status === "completed")
                      ? "bg-brand text-white"
                      : "bg-slate-200 text-slate-500"
                  )}>
                    2
                  </div>
                  <span className={cn(
                    "mt-2 text-[10px] font-bold transition-all duration-300",
                    (activeOrder.status === "paid" || activeOrder.status === "processing" || activeOrder.status === "completed")
                      ? "text-slate-800"
                      : "text-slate-400"
                  )}>
                    Pago Reportado
                  </span>
                </div>

                {/* Step 3: En Proceso */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full font-extrabold text-xs ring-4 ring-white shadow-sm transition-all duration-300",
                    (activeOrder.status === "processing" || activeOrder.status === "completed")
                      ? "bg-brand text-white"
                      : "bg-slate-200 text-slate-500"
                  )}>
                    3
                  </div>
                  <span className={cn(
                    "mt-2 text-[10px] font-bold transition-all duration-300",
                    (activeOrder.status === "processing" || activeOrder.status === "completed")
                      ? "text-slate-800"
                      : "text-slate-400"
                  )}>
                    Pago Aceptado
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CLUB WOUNDU & SEGURIDAD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-3xl border border-slate-200/60 bg-gradient-to-br from-indigo-50/50 to-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                Club Woundu
              </span>
              <h3 className="text-base font-black text-slate-900 mt-3">Miembro Comprador</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                ¡Gracias por ser parte de Woundu! Explora cientos de productos de diversos vendedores en todo el país y califica tus experiencias.
              </p>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Tu reputación</span>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded-md">
                {profile?.reputationScore?.toFixed(1) || "5.0"} ⭐
              </span>
            </div>
          </div>

          <div className="md:col-span-2 rounded-3xl border border-slate-200/60 bg-gradient-to-br from-emerald-50/50 to-white p-6 shadow-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
              Seguridad Woundu
            </span>
            <h3 className="text-base font-black text-slate-900 mt-3">Guía de compra inteligente</h3>
            <ul className="mt-3 space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Pagos directos:</strong> Woundu facilita el contacto comercial. Pagas directo al vendedor usando sus datos bancarios o de contacto.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Reporta comprobantes:</strong> Siempre sube el capture del pago en tu panel de pedidos para que el vendedor procese rápido.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Chat Directo:</strong> Usa el botón de WhatsApp en la orden o el producto para consultar dudas sobre stock, envíos o colores.</span>
              </li>
            </ul>
          </div>
        </div>

        <PendingReviewsSection pendingReviews={pendingReviews} />

        {/* 3. HISTORIAL & GUARDADOS */}
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <AccountBuyerOrders buyerOrders={buyerOrders} />
          <AccountBuyerFavorites favoriteProducts={favoriteProducts} />
        </div>

        {/* 4. SUGERENCIAS DE COMPRA */}
        {suggestedProducts && suggestedProducts.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-slate-200/60 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-black text-slate-950">Te puede interesar</h2>
              <p className="text-sm text-slate-600">Publicaciones populares y novedades del marketplace en Colombia.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {suggestedProducts.map((p) => {
                const isFavorite = favIds.has(p.id);
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    initialFavorited={isFavorite}
                    viewerId={profile?.id || null}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
