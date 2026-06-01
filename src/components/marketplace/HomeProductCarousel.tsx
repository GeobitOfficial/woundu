"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";

import type { ProductCardItem } from "@/features/products";

import { HomeProductCard } from "./HomeProductCard";

type HomeProductCarouselProps = Readonly<{
  title: string;
  subtitle?: string;
  products: ReadonlyArray<ProductCardItem>;
  viewAllHref: string;
  viewAllLabel?: string;
  variant?: "default" | "deals";
}>;

export function HomeProductCarousel({
  products,
  subtitle,
  title,
  viewAllHref,
  viewAllLabel = "Ver todo",
  variant = "default",
}: HomeProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return null;
  }

  const isDeals = variant === "deals";

  function scrollBy(direction: "left" | "right") {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    const amount = direction === "left" ? -320 : 320;
    node.scrollBy({ behavior: "smooth", left: amount });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div
          className={
            isDeals
              ? "flex items-center justify-between gap-4 border-b border-brand/20 bg-brand-light px-4 py-3 sm:px-5"
              : "flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 sm:px-5"
          }
        >
          <div>
            <h2 className="text-lg font-bold text-slate-950 sm:text-xl">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
            ) : null}
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand hover:text-brand-dark hover:underline"
            href={viewAllHref}
          >
            {viewAllLabel}
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          <CarouselButton
            ariaLabel="Ver productos anteriores"
            className="left-1"
            onClick={() => scrollBy("left")}
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </CarouselButton>

          <div
            className="flex overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            ref={scrollRef}
          >
            {products.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>

          <CarouselButton
            ariaLabel="Ver más productos"
            className="right-1"
            onClick={() => scrollBy("right")}
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </CarouselButton>
        </div>
      </div>
    </section>
  );
}

function CarouselButton({
  ariaLabel,
  children,
  className,
  onClick,
}: Readonly<{
  ariaLabel: string;
  children: ReactNode;
  className: string;
  onClick: () => void;
}>) {
  return (
    <button
      aria-label={ariaLabel}
      className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 sm:flex ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
