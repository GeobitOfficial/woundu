import type { Metadata } from "next";
import { Suspense } from "react";

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
    <main className="min-h-screen bg-[#eaeded]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-[#232f3e] px-4 py-4 text-white sm:px-6">
            <p className="text-xs font-bold uppercase tracking-wide text-brand">
              Catálogo comercial
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{pageTitle}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Productos segmentados por categoría con precio, calificación y
              ofertas. Usa los departamentos para filtrar o ajusta búsqueda y
              precio abajo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
            {selectedCategory ? (
              <div className="rounded-sm bg-brand-light px-3 py-2 text-sm text-brand-dark">
                Filtrando: <strong>{selectedCategory.name}</strong>
              </div>
            ) : null}
            {countryForQuery ? (
              <div className="rounded-sm bg-brand-light px-3 py-2 text-sm text-brand-dark">
                País: <strong>{countryForQuery}</strong>
              </div>
            ) : null}
          </div>
        </header>

        <div className="space-y-6">
          <MarketplaceFiltersPanel
            activeCountryName={countryForQuery}
            hrefState={hrefState}
          />

          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="h-24 animate-pulse rounded-sm border border-slate-200 bg-white shadow-sm" />
                <div className="h-64 animate-pulse rounded-sm border border-slate-200 bg-white shadow-sm" />
                <div className="h-[32rem] animate-pulse rounded-sm border border-slate-200 bg-white shadow-sm" />
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
    </main>
  );
}
