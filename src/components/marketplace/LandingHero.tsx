import Link from "next/link";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";

import { Badge, buttonVariants } from "@/components/ui";
import type {
  LandingHomeCopy,
  LandingPageSnapshot,
  ProductCardItem,
} from "@/features/products";
import { cn } from "@/lib/utils";

type LandingHeroProps = Readonly<{
  copy: LandingHomeCopy;
  snapshot: LandingPageSnapshot;
}>;

export function LandingHero({ copy, snapshot }: LandingHeroProps) {
  const product = snapshot.showcasedProduct;

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.35),_transparent_38%),radial-gradient(circle_at_90%_20%,_rgba(125,211,252,0.22),_transparent_42%),linear-gradient(135deg,_#ecfdf5_0%,_#f0f9ff_48%,_#fae8ff_100%)]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div>
          <Badge variant="brand">{copy.heroBadge}</Badge>
          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {copy.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className={cn(buttonVariants({ size: "lg", variant: "primary" }))}
              href="/marketplace"
            >
              Explorar marketplace
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
              )}
              href="/publicar"
            >
              Publicar producto
            </Link>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {copy.heroStats.map((stat) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm shadow-slate-950/5"
                key={stat.label}
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-lg font-bold text-slate-950">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute inset-6 rounded-[2rem] bg-emerald-200/60 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-2xl shadow-emerald-950/10 backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Vitrina del catálogo</p>
                  <p className="text-xl font-bold">
                    {product ? "Publicación destacada" : "Sin vitrina aún"}
                  </p>
                </div>
                {product && isRecentlyPublished(product) ? (
                  <span className="shrink-0 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-emerald-950">
                    Reciente
                  </span>
                ) : null}
              </div>

              {product ? (
                <Link className="mt-6 block text-left" href={showcaseHref(product)}>
                  <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-emerald-300 via-cyan-200 to-white p-5 transition hover:opacity-95">
                    <div className="flex h-full flex-col justify-between rounded-2xl bg-white/30 p-4 backdrop-blur-sm">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        {product.category ? (
                          <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-white">
                            {product.category.name}
                          </span>
                        ) : null}
                        {product.isOnOffer ? (
                          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-emerald-950">
                            Oferta
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                          {product.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-end gap-2">
                          {product.isOnOffer && product.compareAtPrice != null ? (
                            <p className="text-sm font-medium text-slate-500 line-through">
                              {formatMoney(product.compareAtPrice, product.currency)}
                            </p>
                          ) : null}
                          <p className="text-3xl font-black text-slate-950">
                            {formatMoney(product.price, product.currency)}
                          </p>
                        </div>
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                          <Star
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-amber-500"
                          />
                          {product.reviewCount > 0
                            ? `${product.ratingAverage.toFixed(1)} (${product.reviewCount})`
                            : "Sin reseñas"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="mt-6 flex aspect-[4/3] flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center">
                  <p className="text-sm text-slate-300">
                    Cuando exista al menos una publicación activa, verás aquí una
                    de muestra enlazada al marketplace.
                  </p>
                  <Link
                    className={cn(
                      buttonVariants({ className: "mt-4", variant: "primary" }),
                    )}
                    href="/publicar"
                  >
                    Crear publicación
                  </Link>
                </div>
              )}

              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {copy.showcaseBullets.map((item) => (
                  <li className="flex items-center gap-2" key={item}>
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-emerald-300"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function showcaseHref(product: ProductCardItem): string {
  if (product.category?.slug) {
    return `/marketplace?categoria=${encodeURIComponent(product.category.slug)}`;
  }
  if (product.isOnOffer) {
    return "/marketplace?solo_ofertas=1";
  }
  return "/marketplace";
}

function formatMoney(price: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function isRecentlyPublished(product: ProductCardItem): boolean {
  if (!product.publishedAt) {
    return false;
  }
  const published = new Date(product.publishedAt).getTime();
  return Date.now() - published < 14 * 86400000;
}
