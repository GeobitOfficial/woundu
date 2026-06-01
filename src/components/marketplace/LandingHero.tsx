import Link from "next/link";
import { ArrowRight, MapPin, Percent, Sparkles, Tag } from "lucide-react";

import type { LandingPageSnapshot, ProductCardItem } from "@/features/products";
import {
  formatProductPrice,
  getProductDiscountPercent,
  getProductMarketplaceHref,
} from "@/utils/productDisplay";

import { HomeSearchBar } from "./HomeSearchBar";
import { ProductRatingStars } from "./ProductRatingStars";
import { ProductThumbnail } from "./ProductThumbnail";

type LandingHeroProps = Readonly<{
  snapshot: LandingPageSnapshot;
}>;

export function LandingHero({ snapshot }: LandingHeroProps) {
  const product = snapshot.showcasedProduct;

  return (
    <section className="relative overflow-hidden bg-[#eaeded]">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/15 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_22rem] lg:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-dark shadow-sm">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Vitrina comercial Woundu
            </p>

            <HomeSearchBar size="large" />

            <div className="mt-4 flex flex-wrap gap-2">
              <HeroShortcut
                href="/marketplace?solo_ofertas=1"
                icon={Percent}
                label="Ofertas"
              />
              <HeroShortcut href="/marketplace" label="Catálogo" />
              <HeroShortcut href="/publicar" icon={Tag} label="Vender" />
            </div>
          </div>

          {product ? (
            <FeaturedProductCard product={product} />
          ) : (
            <FeaturedPlaceholder />
          )}
        </div>
      </div>
    </section>
  );
}

function HeroShortcut({
  href,
  icon: Icon,
  label,
}: Readonly<{
  href: string;
  icon?: typeof Percent;
  label: string;
}>) {
  return (
    <Link
      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-brand hover:bg-white hover:text-brand-dark"
      href={href}
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4 text-brand" /> : null}
      {label}
    </Link>
  );
}

function FeaturedProductCard({ product }: Readonly<{ product: ProductCardItem }>) {
  const href = getProductMarketplaceHref(product);
  const discount = getProductDiscountPercent(product);

  return (
    <Link
      className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-xl"
      href={href}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-hover to-brand-dark"
      />

      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4">
        <ProductThumbnail
          className="aspect-square rounded-xl bg-slate-50 p-2"
          product={product}
        />

        <div className="flex min-w-0 flex-col">
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-brand-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-dark">
            <Tag aria-hidden="true" className="h-3 w-3" />
            Destacado hoy
          </span>

          <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 group-hover:text-brand">
            {product.title}
          </h2>

          <div className="mt-2">
            {product.isOnOffer && product.compareAtPrice != null ? (
              <p className="text-xs text-slate-400 line-through">
                {formatProductPrice(product.compareAtPrice, product.currency)}
              </p>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-2xl font-black text-slate-950">
                {formatProductPrice(product.price, product.currency)}
              </p>
              {discount != null ? (
                <span className="text-xs font-bold text-brand">
                  {discount}% OFF
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
            <ProductRatingStars
              ratingAverage={product.ratingAverage}
              reviewCount={product.reviewCount}
            />
            {product.country ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin aria-hidden="true" className="h-3 w-3" />
                {product.country}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <span className="mt-4 inline-flex items-center text-xs font-semibold text-brand group-hover:underline">
        Ver producto
        <ArrowRight aria-hidden="true" className="ml-1 h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function FeaturedPlaceholder() {
  return (
    <div className="flex min-h-[12rem] flex-col justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-800">
        Tu próximo producto destacado puede aparecer aquí
      </p>
      <Link
        className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-hover"
        href="/publicar"
      >
        Publicar ahora
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  );
}
