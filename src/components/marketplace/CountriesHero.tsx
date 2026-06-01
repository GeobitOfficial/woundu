import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  MapPin,
  Package,
  Sparkles,
  Store,
} from "lucide-react";

import { buttonVariants } from "@/components/ui";
import type { CountryCoverageSummary } from "@/lib/marketplaceCountryCoverage";
import { cn } from "@/lib/utils";

type CountriesHeroProps = Readonly<{
  summary: CountryCoverageSummary;
}>;

export function CountriesHero({ summary }: CountriesHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#eaeded]">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-brand/20 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 top-8 h-56 w-56 rounded-full bg-brand/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_20rem] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-dark shadow-sm">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Cobertura regional
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
              Compra y vende en Latinoamérica y el Caribe
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Woundu organiza el catálogo por país para que encuentres productos
              cerca de ti, publiques con contexto local y explores un marketplace
              pensado para la región.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className={cn(buttonVariants({ size: "lg", variant: "primary" }))}
                href="/marketplace"
              >
                Ver catálogo completo
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
                href="/publicar"
              >
                Publicar en mi país
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <HeroStatCard
              icon={Globe2}
              label="Países cubiertos"
              value={String(summary.totalCountries)}
            />
            <HeroStatCard
              icon={MapPin}
              label="Mercados con publicaciones"
              value={String(summary.countriesWithListings)}
            />
            <HeroStatCard
              icon={Package}
              label="Productos activos"
              value={String(summary.totalProducts)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStatCard({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: typeof Globe2;
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-muted text-brand-dark">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-sm leading-5 text-slate-600">{label}</p>
    </div>
  );
}

export function CountriesTopMarkets({
  summary,
}: Readonly<{ summary: CountryCoverageSummary }>) {
  const activeMarkets = summary.topCountries.filter(
    (country) => country.productCount > 0,
  );

  if (activeMarkets.length === 0) {
    return (
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-dark">
                <Store aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Sé el primero en tu país
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Aún no hay mercados activos con publicaciones. Publica tu
                  primer producto y abre el catálogo en tu región.
                </p>
              </div>
            </div>
            <Link
              className={cn(
                buttonVariants({ className: "w-full sm:w-auto", variant: "primary" }),
              )}
              href="/publicar"
            >
              Publicar ahora
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
              Mercados más activos
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Accede directo a los países con más publicaciones disponibles.
            </p>
          </div>
          <Link
            className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:inline-flex"
            href="/marketplace"
          >
            Ver todo
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeMarkets.map((country) => (
            <Link
              className="group min-w-[10.5rem] shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand hover:bg-brand-light"
              href={`/marketplace?pais=${country.slug}`}
              key={country.name}
            >
              <span aria-hidden="true" className="text-3xl">
                {country.flagEmoji}
              </span>
              <p className="mt-3 line-clamp-2 text-sm font-bold text-slate-950">
                {country.name}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 group-hover:text-brand-dark">
                {country.productCount} producto
                {country.productCount === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
