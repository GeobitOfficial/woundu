import type { Metadata } from "next";
import { Suspense } from "react";

import {
  CatalogProductSections,
  MarketplaceCategorySection,
  MarketplaceCatalogWithFavorites,
  MarketplaceFiltersPanel,
} from "@/components/marketplace";
import {
  latinAmericaCountryFromSlug,
  latinAmericaCountryToSlug,
} from "@/constants/latinAmericaCountries";
import {
  buildMarketplaceCategorySections,
  getMarketplaceCategories,
  getMarketplaceProducts,
} from "@/features/products";
import { buildProductCountByCategoryId } from "@/lib/marketplaceCategoryCounts";
import {
  type MarketplaceHrefValues,
  parseMinStarsQueryParam,
  parseOnSaleQueryParam,
  parsePriceQueryParam,
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

  const hrefState: MarketplaceHrefValues = {
    categorySlug,
    search,
    countrySlug: countrySlugCanonical,
    minPrice: minPrecio,
    maxPrice: maxPrecio,
    minStars: minEstrellas,
    onSaleOnly: soloOfertas,
  };

  const [categories, products] = await Promise.all([
    getMarketplaceCategories(),
    getMarketplaceProducts({
      categorySlug,
      country: countryForQuery,
      search,
      minPrice: minPrecio,
      maxPrice: maxPrecio,
      minStars: minEstrellas,
      onSaleOnly: soloOfertas,
    }),
  ]);

  const productCountByCategoryId = buildProductCountByCategoryId(products);
  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;

  const categorySections =
    products.length > 0
      ? buildMarketplaceCategorySections(categories, products)
      : [];

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
          <div className="flex flex-wrap items-center gap-6 px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Resultados
              </p>
              <p className="text-2xl font-bold text-slate-950">{products.length}</p>
            </div>
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
          <MarketplaceCategorySection
            categories={categories}
            hrefState={hrefState}
            productCountByCategoryId={productCountByCategoryId}
            selectedCategorySlug={categorySlug}
            totalProductCount={products.length}
          />

          <MarketplaceFiltersPanel
            activeCountryName={countryForQuery}
            hrefState={hrefState}
          />

          <Suspense
            fallback={
              products.length > 0 ? (
                <CatalogProductSections
                  favoriteProductIds={[]}
                  hrefState={hrefState}
                  sections={categorySections}
                  viewerId={null}
                />
              ) : (
                <div className="h-48 animate-pulse rounded-sm bg-white" />
              )
            }
          >
            <MarketplaceCatalogWithFavorites
              countryName={countryForQuery}
              hrefState={hrefState}
              products={products}
              sections={categorySections}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
