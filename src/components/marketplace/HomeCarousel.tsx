"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import type { ProductCardItem } from "@/features/products";
import { cn } from "@/lib/utils";
import {
  formatProductPrice,
  getProductDiscountPercent,
  getProductImageUrl,
  getProductMarketplaceHref,
} from "@/utils/productDisplay";

type HomeCarouselProps = Readonly<{
  products: ReadonlyArray<ProductCardItem>;
}>;

export function HomeCarousel({ products }: HomeCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) {
    return (
      <div className="relative h-[24rem] w-full flex flex-col items-center justify-center bg-slate-900 border-b border-slate-800 text-slate-400">
        <Sparkles className="h-8 w-8 text-brand mb-2 animate-pulse" />
        <p className="text-sm font-semibold">
          Tu próximo banner del carrusel aparecerá aquí
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[24rem] w-full overflow-hidden bg-slate-950 text-white md:h-[30rem]">
      {/* Slides */}
      {products.map((product, index) => {
        const isCurrent = index === activeIndex;
        const discount = getProductDiscountPercent(product);
        const href = getProductMarketplaceHref(product);
        const imageUrl = getProductImageUrl(product.primaryImage?.storagePath);

        return (
          <div
            key={product.id}
            className={cn(
              "absolute inset-0 flex flex-col md:flex-row transition-all duration-700 ease-in-out",
              isCurrent
                ? "opacity-100 translate-x-0 z-10"
                : "opacity-0 translate-x-12 pointer-events-none"
            )}
          >
            {/* Contenedor alineado para el contenido */}
            <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row px-4 sm:px-6 lg:px-8 h-full">
              {/* Lado Izquierdo: Info (Tema Oscuro) */}
              <div className="flex flex-1 flex-col justify-center py-6 pr-4 md:py-12 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent z-20">
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  Destacado Woundu
                </span>
                <h2 className="text-xl md:text-4xl font-extrabold leading-tight text-white line-clamp-2 mb-3">
                  {product.title}
                </h2>
                <div className="flex items-baseline gap-2.5 mb-5">
                  {product.isOnOffer && product.compareAtPrice != null && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatProductPrice(product.compareAtPrice, product.currency)}
                    </span>
                  )}
                  <span className="text-2xl md:text-4xl font-black text-brand">
                    {formatProductPrice(product.price, product.currency)}
                  </span>
                  {discount != null && (
                    <span className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-bold text-slate-950 uppercase">
                      {discount}% OFF
                        </span>
                  )}
                </div>
                <Link
                  href={href}
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-brand-hover shadow-md shadow-brand/10"
                >
                  Comprar ahora
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Lado Derecho: Imagen del Producto */}
              <div className="relative flex-1 flex items-center justify-center p-4 bg-slate-950 md:bg-transparent z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="max-h-[10rem] md:max-h-[20rem] w-auto object-contain transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Controles de Navegación manual (Flechas) */}
      {products.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between pointer-events-none">
          <button
            type="button"
            onClick={() =>
              setActiveIndex(
                (prev) =>
                  (prev - 1 + products.length) % products.length
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-all pointer-events-auto"
            aria-label="Anterior slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveIndex(
                (prev) => (prev + 1) % products.length
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-all pointer-events-auto"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Dots indicadores */}
      {products.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex ? "w-5 bg-brand" : "w-1.5 bg-white/40"
              )}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
