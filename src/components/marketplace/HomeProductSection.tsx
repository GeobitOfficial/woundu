"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";

import type { HomeProductSectionData, ProductCardItem } from "@/features/products";

import { HomeVitrineCard } from "./HomeVitrineCard";
import { SectionReferenceImage } from "./SectionReferenceImage";

type HomeProductSectionProps = Readonly<{
  section: HomeProductSectionData;
}>;

export function HomeProductSection({ section }: HomeProductSectionProps) {
  switch (section.theme) {
    case "spotlight-dark":
      return <SpotlightDarkSection section={section} />;
    case "deals-banner":
      return <DealsBannerSection section={section} />;
    case "split-showcase":
      return <SplitShowcaseSection section={section} />;
    case "floating-cards":
      return <FloatingCardsSection section={section} />;
    case "editorial":
      return <EditorialSection section={section} />;
    case "bento-grid":
      return <BentoGridSection section={section} />;
    case "marketplace-grid":
    default:
      return <MarketplaceGridSection section={section} />;
  }
}

function SpotlightDarkSection({
  section,
}: Readonly<{ section: HomeProductSectionData }>) {
  return (
    <section
      aria-labelledby={`home-section-${section.id}`}
      className="bg-[#131921] py-10 lg:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-stretch">
          <SectionReferenceImage
            className="hidden min-h-[14rem] rounded-2xl ring-1 ring-white/10 lg:block"
            image={section.referenceImage}
            overlayClassName="bg-gradient-to-t from-[#131921]/50 to-transparent"
          />

          <div>
            <SectionHeader
              dark
              icon={TrendingUp}
              id={section.id}
              linkHref={section.viewAllHref}
              linkLabel={section.viewAllLabel}
              subtitle="Los productos con mejor desempeño del marketplace"
              title={section.title}
            />

            <SectionReferenceImage
              className="mb-5 h-40 rounded-2xl ring-1 ring-white/10 lg:hidden"
              image={section.referenceImage}
              overlayClassName="bg-gradient-to-t from-[#131921]/40 to-transparent"
            />

            {section.products.length === 0 ? (
              <EmptyStrip dark section={section} />
            ) : (
              <CarouselTrack cardVariant="spotlight" products={section.products} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DealsBannerSection({
  section,
}: Readonly<{ section: HomeProductSectionData }>) {
  return (
    <section
      aria-labelledby={`home-section-${section.id}`}
      className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark py-10 lg:py-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] lg:items-center">
          <div>
            <SectionHeader
              icon={Flame}
              id={section.id}
              linkHref={section.viewAllHref}
              linkLabel={section.viewAllLabel}
              lightOnColor
              subtitle="Descuentos activos con precio tachado y ahorro visible"
              title={section.title}
            />

            {section.products.length === 0 ? (
              <EmptyStrip lightOnColor section={section} />
            ) : (
              <div className="rounded-2xl bg-white/95 p-3 shadow-2xl shadow-black/10 backdrop-blur sm:p-4">
                <CarouselTrack cardVariant="deal" products={section.products} />
              </div>
            )}
          </div>

          <SectionReferenceImage
            className="h-44 rounded-2xl shadow-2xl ring-2 ring-white/30 sm:h-52 lg:h-full lg:min-h-[18rem]"
            image={section.referenceImage}
          />
        </div>
      </div>
    </section>
  );
}

function SplitShowcaseSection({
  section,
}: Readonly<{ section: HomeProductSectionData }>) {
  return (
    <section
      aria-labelledby={`home-section-${section.id}`}
      className="py-8 lg:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="relative min-h-[16rem] lg:min-h-full">
            <SectionReferenceImage
              className="absolute inset-0"
              image={section.referenceImage}
              overlayClassName="bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"
            />
            <div className="relative flex h-full flex-col justify-end p-6 text-white lg:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-light">
                Colección
              </p>
              <h2
                className="mt-3 text-3xl font-black leading-tight"
                id={`home-section-${section.id}`}
              >
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-100">
                Selección curada para comprar rápido con precio visible y
                calificación del vendedor.
              </p>
              <Link
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-brand-light"
                href={section.viewAllHref}
              >
                {section.viewAllLabel}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-100 p-4 lg:border-l lg:border-t-0 lg:p-5">
            {section.products.length === 0 ? (
              <EmptyStrip compact section={section} />
            ) : (
              <CarouselTrack
                cardVariant="elevated"
                products={section.products}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCardsSection({
  section,
}: Readonly<{ section: HomeProductSectionData }>) {
  return (
    <section
      aria-labelledby={`home-section-${section.id}`}
      className="bg-[#f7fafa] py-10 lg:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-stretch">
          <SectionHeader
            className="mb-0 p-5 pb-0 sm:p-6"
            icon={Zap}
            id={section.id}
            linkHref={section.viewAllHref}
            linkLabel={section.viewAllLabel}
            subtitle="Lo último en electrónica, accesorios y gadgets"
            title={section.title}
          />
          <SectionReferenceImage
            className="aspect-[5/3] w-full border-t border-slate-100 lg:aspect-auto lg:min-h-[14rem] lg:self-stretch lg:border-l lg:border-t-0"
            image={section.referenceImage}
            imageClassName="object-cover"
          />
        </div>

        {section.products.length === 0 ? (
          <EmptyStrip section={section} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {section.products.slice(0, 4).map((product) => (
              <HomeVitrineCard
                key={product.id}
                product={product}
                variant="bento"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EditorialSection({
  section,
}: Readonly<{ section: HomeProductSectionData }>) {
  return (
    <section
      aria-labelledby={`home-section-${section.id}`}
      className="py-10 lg:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              Estilo
            </p>
            <h2
              className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
              id={`home-section-${section.id}`}
            >
              {section.title}
            </h2>
            <Link
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 underline-offset-4 hover:text-brand hover:underline"
              href={section.viewAllHref}
            >
              {section.viewAllLabel}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <SectionReferenceImage
            className="h-48 rounded-2xl shadow-md ring-1 ring-slate-200/80 sm:h-56"
            image={section.referenceImage}
          />
        </div>

        {section.products.length === 0 ? (
          <EmptyStrip className="mt-6" section={section} />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {section.products.slice(0, 4).map((product) => (
              <HomeVitrineCard
                key={product.id}
                product={product}
                variant="bento"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BentoGridSection({
  section,
}: Readonly<{ section: HomeProductSectionData }>) {
  const products = section.products.slice(0, 6);

  return (
    <section
      aria-labelledby={`home-section-${section.id}`}
      className="py-8 lg:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={Sparkles}
          id={section.id}
          linkHref={section.viewAllHref}
          linkLabel={section.viewAllLabel}
          subtitle="Soluciones profesionales listas para contratar o comprar"
          title={section.title}
        />

        {products.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <SectionReferenceImage
              className="min-h-[16rem] rounded-2xl ring-1 ring-slate-200/80"
              image={section.referenceImage}
            />
            <EmptyStrip section={section} />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SectionReferenceImage
              className="min-h-[18rem] rounded-2xl ring-1 ring-slate-200/80 md:row-span-2"
              image={section.referenceImage}
            />
            {products[0] ? (
              <HomeVitrineCard
                className="md:row-span-2"
                key={products[0].id}
                product={products[0]}
                variant="bento"
              />
            ) : null}
            {products.slice(1).map((product) => (
              <HomeVitrineCard
                key={product.id}
                product={product}
                variant="bento"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MarketplaceGridSection({
  section,
}: Readonly<{ section: HomeProductSectionData }>) {
  const products = section.products.slice(0, 12);

  return (
    <section
      aria-labelledby={`home-section-${section.id}`}
      className="border-t border-slate-200/80 bg-white py-10 lg:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReferenceImage
          className="mb-6 h-44 rounded-2xl shadow-sm ring-1 ring-slate-200/80 sm:h-52"
          image={section.referenceImage}
        />

        <SectionHeader
          id={section.id}
          linkHref={section.viewAllHref}
          linkLabel={section.viewAllLabel}
          subtitle="Explora más publicaciones activas del catálogo"
          title={section.title}
        />

        {products.length === 0 ? (
          <EmptyStrip section={section} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {products.map((product) => (
              <HomeVitrineCard
                className="min-w-0 max-w-none rounded-xl border border-slate-100 shadow-sm"
                key={product.id}
                product={product}
                variant="bento"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  className,
  dark = false,
  icon: Icon,
  id,
  lightOnColor = false,
  linkHref,
  linkLabel,
  subtitle,
  title,
}: Readonly<{
  className?: string;
  dark?: boolean;
  icon?: LucideIcon;
  id: string;
  lightOnColor?: boolean;
  linkHref: string;
  linkLabel: string;
  subtitle?: string;
  title: string;
}>) {
  const titleClass = dark
    ? "text-white"
    : lightOnColor
      ? "text-slate-950"
      : "text-slate-950";
  const subtitleClass = dark
    ? "text-slate-300"
    : lightOnColor
      ? "text-slate-800/80"
      : "text-slate-600";
  const linkClass = dark
    ? "text-brand hover:text-brand-light"
    : lightOnColor
      ? "text-slate-950 hover:text-slate-800"
      : "text-brand hover:text-brand-dark";

  return (
    <div
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className ?? ""}`}
    >
      <div>
        {Icon ? (
          <span
            className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
              dark
                ? "bg-white/10 text-brand"
                : lightOnColor
                  ? "bg-white/70 text-brand-dark"
                  : "bg-brand-light text-brand-dark"
            }`}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        ) : null}
        <h2
          className={`text-2xl font-black tracking-tight sm:text-3xl ${titleClass}`}
          id={`home-section-${id}`}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={`mt-2 max-w-2xl text-sm ${subtitleClass}`}>{subtitle}</p>
        ) : null}
      </div>
      <Link
        className={`inline-flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline ${linkClass}`}
        href={linkHref}
      >
        {linkLabel}
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  );
}

function CarouselTrack({
  cardVariant,
  products,
}: Readonly<{
  cardVariant: "spotlight" | "deal" | "elevated" | "compact";
  products: ReadonlyArray<ProductCardItem>;
}>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: "left" | "right") {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    node.scrollBy({
      behavior: "smooth",
      left: direction === "left" ? -360 : 360,
    });
  }

  return (
    <div className="relative">
      <CarouselButton
        ariaLabel="Ver productos anteriores"
        className="left-0"
        onClick={() => scrollBy("left")}
      >
        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
      </CarouselButton>
      <div
        className="flex gap-3 overflow-x-auto scroll-smooth px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
        ref={scrollRef}
      >
        {products.map((product) => (
          <HomeVitrineCard
            key={product.id}
            product={product}
            variant={cardVariant}
          />
        ))}
      </div>
      <CarouselButton
        ariaLabel="Ver más productos"
        className="right-0"
        onClick={() => scrollBy("right")}
      >
        <ChevronRight aria-hidden="true" className="h-5 w-5" />
      </CarouselButton>
    </div>
  );
}

function EmptyStrip({
  className,
  compact = false,
  dark = false,
  lightOnColor = false,
  section,
}: Readonly<{
  className?: string;
  compact?: boolean;
  dark?: boolean;
  lightOnColor?: boolean;
  section: HomeProductSectionData;
}>) {
  const shellClass = dark
    ? "border-white/10 bg-white/5 text-slate-200"
    : lightOnColor
      ? "border-white/40 bg-white/70 text-slate-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div
      className={`flex ${compact ? "min-h-[12rem]" : "min-h-[14rem]"} flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center ${shellClass} ${className ?? ""}`}
    >
      <p className="text-sm font-semibold">
        Pronto verás productos en {section.title.toLowerCase()}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          className="inline-flex items-center gap-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-hover"
          href={section.viewAllHref}
        >
          {section.viewAllLabel}
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <Link
          className="inline-flex items-center gap-1 rounded-full border border-current px-4 py-2 text-sm font-semibold transition hover:opacity-80"
          href="/publicar"
        >
          Publicar aquí
        </Link>
      </div>
    </div>
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
      className={`absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:scale-105 hover:bg-slate-50 sm:flex ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
