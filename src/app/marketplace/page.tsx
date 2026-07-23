import type { Metadata } from "next";
import { Suspense } from "react";
import { Store } from "lucide-react";

import {
  MarketplaceFiltersPanel,
  MarketplaceResultsSection,
} from "@/components/marketplace";
import {
  latinAmericaCountryFromSlug,
  latinAmericaCountryToSlug,
} from "@/constants/latinAmericaCountries";
import { getMarketplaceCategories } from "@/features/products";
import {
  type MarketplaceHrefValues,
  parseMinStarsQueryParam,
  parseOnSaleQueryParam,
  parseOnlineOnlyQueryParam,
  parsePageQueryParam,
  parsePriceQueryParam,
  parseSortByQueryParam,
} from "@/lib/marketplaceFilters";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Explora productos activos en Woundu por categoría, país, precio, calificación y ofertas.",
};

type MarketplacePageProps = Readonly<{
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    pais?: string;
    min_precio?: string;
    max_precio?: string;
    min_estrellas?: string;
    solo_ofertas?: string;
    solo_online?: string;
    orden?: string;
    pagina?: string;
  }>;
}>;

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const params = await searchParams;
  const categorySlug = params.categoria?.trim() || undefined;
  const search = params.q?.trim() || undefined;
  const countrySlugInput = params.pais?.trim();
  const countryName =
    countrySlugInput && countrySlugInput.length > 0
      ? latinAmericaCountryFromSlug(countrySlugInput)
      : null;
  const countryForQuery = countryName ?? undefined;
  const countrySlugCanonical = countryName
    ? latinAmericaCountryToSlug(countryName)
    : undefined;

  const minPrecio = parsePriceQueryParam(params.min_precio);
  const maxPrecio = parsePriceQueryParam(params.max_precio);
  const minEstrellas = parseMinStarsQueryParam(params.min_estrellas);
  const soloOfertas = parseOnSaleQueryParam(params.solo_ofertas);
  const soloOnline = parseOnlineOnlyQueryParam(params.solo_online);
  const sortBy = parseSortByQueryParam(params.orden);
  const requestedPage = parsePageQueryParam(params.pagina);

  const hrefState: MarketplaceHrefValues = {
    categorySlug,
    search,
    countrySlug: countrySlugCanonical,
    minPrice: minPrecio,
    maxPrice: maxPrecio,
    minStars: minEstrellas,
    onSaleOnly: soloOfertas,
    onlineOnly: soloOnline,
    sortBy,
    page: requestedPage > 1 ? requestedPage : undefined,
  };

  const categories = await getMarketplaceCategories();
  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;

  const pageTitle = selectedCategory
    ? selectedCategory.name
    : countryForQuery
      ? `Productos en ${countryForQuery}`
      : "Marketplace Woundu";

  return (
    <main className="min-h-screen bg-[#eaeded] pb-12">
      
      {/* 1. HEADER BANNER REDISEÑADO A ANCHO COMPLETO */}
      <header className="relative w-full overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 text-white shadow-xl border-b border-slate-800">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-12 relative md:py-12">
          <Store className="absolute right-8 top-1/2 -translate-y-1/2 h-24 w-24 text-white/5 pointer-events-none md:h-32 md:w-32" />
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand">
              Catálogo comercial
            </span>
            <h1 className="mt-2 text-2xl font-black md:text-4xl text-white">
              {pageTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              Explora los mejores productos en el marketplace de Woundu. Filtra por categoría, rango de precios o país.
            </p>
            {/* Filtros seleccionados activos en el encabezado */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              {selectedCategory ? (
                <span className="rounded-full bg-brand/20 border border-brand/30 px-3 py-1.5 text-brand">
                  Categoría: {selectedCategory.name}
                </span>
              ) : null}
              {countryForQuery ? (
                <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-blue-400">
                  País: {countryForQuery}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* 2. DISEÑO DE COLUMNAS CON ANCHO COMPLETO A LA IZQUIERDA Y DERECHA */}
      <div className="w-full px-4 py-8 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Panel de Filtros & Categorías (Compacto al extremo izquierdo) */}
          <aside className="lg:col-span-3 xl:col-span-2 lg:sticky lg:top-24">
            <MarketplaceFiltersPanel
              activeCountryName={countryForQuery}
              hrefState={hrefState}
              categories={categories}
            />
          </aside>

          {/* Columna Derecha: Listado de Productos (Mayor espacio de visualización) */}
          <div className="lg:col-span-9 xl:col-span-10">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-96 animate-pulse rounded-3xl bg-white shadow-sm border border-slate-200"
                    />
                  ))}
                </div>
              }
            >
              <MarketplaceResultsSection
                activeCountryName={countryForQuery}
                categories={categories}
                hrefState={hrefState}
              />
            </Suspense>
          </div>

        </div>
      </div>
    </main>
  );
}
