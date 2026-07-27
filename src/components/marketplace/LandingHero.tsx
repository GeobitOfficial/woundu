"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { LandingPageSnapshot, ProductCardItem } from "@/features/products";
import {
  formatProductPrice,
  getProductMarketplaceHref,
} from "@/utils/productDisplay";

import { ProductRatingStars } from "./ProductRatingStars";
import { ProductThumbnail } from "./ProductThumbnail";
import { HomeCarousel } from "./HomeCarousel";

type LandingHeroProps = Readonly<{
  snapshot: LandingPageSnapshot;
  catalogProducts: ReadonlyArray<ProductCardItem>;
  latestProducts: ReadonlyArray<ProductCardItem>;
  offerProducts: ReadonlyArray<ProductCardItem>;
  topRatedProducts: ReadonlyArray<ProductCardItem>;
  showcasedProduct: ProductCardItem | null;
}>;

export function LandingHero({
  catalogProducts,
  latestProducts,
  offerProducts,
  showcasedProduct,
  snapshot,
  topRatedProducts,
}: LandingHeroProps) {
  // solo 5 productos para aparecer en el carrusel
  const carouselProducts = catalogProducts.slice(0, 5);

  // Fallbacks de productos para asegurar que las 6 tarjetas siempre estén llenas
  const productCard1 = latestProducts[0] || catalogProducts[0];
  const productCard2List = offerProducts.length > 0 ? offerProducts.slice(0, 3) : catalogProducts.slice(0, 3);
  const productCard3 = showcasedProduct || catalogProducts[1] || catalogProducts[0];
  const productCard4 = catalogProducts[2] || catalogProducts[0];
  const productCard5 = catalogProducts.find((p) => p.price < 50000) || catalogProducts[3] || catalogProducts[0];
  const productCard6 = topRatedProducts[0] || catalogProducts[4] || catalogProducts[0];

  return (
    <section className="relative overflow-hidden bg-[#eaeded] pb-10">
      {/* 1. CARRUSEL DE BANNER A ANCHO COMPLETO */}
      <HomeCarousel products={carouselProducts} />

      {/* 2. CUADRÍCULA DE 6 TARJETAS (Dashboard Proporcional Overlapping con Gradiente Azul) */}
      <div className="relative -mt-14 md:-mt-20 z-20 w-full bg-gradient-to-b from-slate-950 via-blue-950 to-[#eaeded] pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 items-stretch">

            {/* Card 1: Última publicación */}
            {productCard1 ? (
              <Link
                href={getProductMarketplaceHref(productCard1)}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl min-h-[16rem]"
              >
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Último agregado
                  </h3>
                  <div className="flex justify-center mb-3">
                    <ProductThumbnail
                      className="h-16 w-16 object-contain rounded-lg bg-slate-50 p-1"
                      product={productCard1}
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-brand transition">
                    {productCard1.title}
                  </h4>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-black text-slate-950">
                    {formatProductPrice(productCard1.price, productCard1.currency)}
                  </p>
                  <span className="mt-2 block text-[11px] font-bold text-brand group-hover:underline">
                    Ver producto
                  </span>
                </div>
              </Link>
            ) : null}

            {/* Card 2: Ofertas rápidas */}
            <div className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl min-h-[16rem]">
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Ofertas rápidas
                </h3>
                {productCard2List.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {productCard2List.map((item) => (
                        <Link
                          key={item.id}
                          href={getProductMarketplaceHref(item)}
                          className="aspect-square bg-slate-50 rounded-lg p-1 border border-slate-100 hover:border-brand transition"
                        >
                          <ProductThumbnail
                            className="h-full w-full object-contain"
                            product={item}
                          />
                        </Link>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      Precios rebajados por tiempo limitado.
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] text-slate-400 text-center py-4">
                    Sin ofertas hoy
                  </p>
                )}
              </div>
              <Link
                className="mt-3 text-[11px] font-bold text-brand hover:underline"
                href="/marketplace?solo_ofertas=1"
              >
                Ver todas las ofertas
              </Link>
            </div>

            {/* Card 3: Destacado hoy */}
            {productCard3 ? (
              <Link
                href={getProductMarketplaceHref(productCard3)}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl min-h-[16rem]"
              >
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Destacado hoy
                  </h3>
                  <div className="flex justify-center mb-3">
                    <ProductThumbnail
                      className="h-16 w-16 object-contain rounded-lg bg-slate-50 p-1"
                      product={productCard3}
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                    {productCard3.title}
                  </h4>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-black text-slate-950 mb-2">
                    {formatProductPrice(productCard3.price, productCard3.currency)}
                  </p>
                  <div className="block w-full rounded-xl bg-brand py-1.5 text-center text-[10px] font-black text-slate-950 transition group-hover:bg-brand-hover shadow-sm">
                    Sigue viendo
                  </div>
                </div>
              </Link>
            ) : null}

            {/* Card 4: Recomendación */}
            {productCard4 ? (
              <Link
                href={getProductMarketplaceHref(productCard4)}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl min-h-[16rem]"
              >
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Recomendado
                  </h3>
                  <div className="flex justify-center mb-3">
                    <ProductThumbnail
                      className="h-16 w-16 object-contain rounded-lg bg-slate-50 p-1"
                      product={productCard4}
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                    {productCard4.title}
                  </h4>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-black text-slate-950">
                    {formatProductPrice(productCard4.price, productCard4.currency)}
                  </p>
                  <span className="mt-2 block text-[11px] font-bold text-brand group-hover:underline">
                    Ver sugerencia
                  </span>
                </div>
              </Link>
            ) : null}

            {/* Card 5: Bajo presupuesto */}
            {productCard5 ? (
              <Link
                href={getProductMarketplaceHref(productCard5)}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl min-h-[16rem]"
              >
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Bajo presupuesto
                  </h3>
                  <div className="flex justify-center mb-3">
                    <ProductThumbnail
                      className="h-16 w-16 object-contain rounded-lg bg-slate-50 p-1"
                      product={productCard5}
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                    {productCard5.title}
                  </h4>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-black text-slate-950">
                    {formatProductPrice(productCard5.price, productCard5.currency)}
                  </p>
                  <span className="mt-2 block text-[11px] font-bold text-brand group-hover:underline">
                    Por menos de $50k
                  </span>
                </div>
              </Link>
            ) : null}

            {/* Card 6: Más vendidos / Valorados */}
            {productCard6 ? (
              <Link
                href={getProductMarketplaceHref(productCard6)}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl min-h-[16rem]"
              >
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Más valorados
                  </h3>
                  <div className="flex justify-center mb-3">
                    <ProductThumbnail
                      className="h-16 w-16 object-contain rounded-lg bg-slate-50 p-1"
                      product={productCard6}
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                    {productCard6.title}
                  </h4>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-0.5 mb-1">
                    <ProductRatingStars
                      ratingAverage={productCard6.ratingAverage}
                      reviewCount={productCard6.reviewCount}
                    />
                  </div>
                  <span className="mt-1 block text-[11px] font-bold text-brand group-hover:underline">
                    Ver producto
                  </span>
                </div>
              </Link>
            ) : null}

          </div>
        </div>
      </div>
    </section>
  );
}
