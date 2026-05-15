import type { Metadata } from "next";

import {
  CatalogEmptyState,
  CatalogProductSections,
  MarketplaceCategorySection,
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
import {
  type MarketplaceHrefValues,
  parseMinStarsQueryParam,
  parseOnSaleQueryParam,
  parsePriceQueryParam,
} from "@/lib/marketplaceFilters";
import { getFavoriteProductIds } from "@/services/supabase/favorites/favoriteService";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const dynamic = "force-dynamic";

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

  const categorySections =
    products.length > 0
      ? buildMarketplaceCategorySections(categories, products)
      : [];

  const supabase = await createSupabaseServerClient();
  let viewerId: string | null = null;
  let favoriteProductIds: string[] = [];

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    viewerId = user?.id ?? null;
    favoriteProductIds = viewerId
      ? [...(await getFavoriteProductIds(supabase, viewerId, products.map((p) => p.id)))]
      : [];
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Marketplace
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {countryForQuery
                ? `Productos en ${countryForQuery}`
                : "Explora productos en Woundu."}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Primero elige una categoría en la cuadrícula. Luego ajusta filtros
              de búsqueda, precio y ofertas, y el país desde la barra superior.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100/70 bg-white/90 px-5 py-4 shadow-sm shadow-emerald-900/10 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Resultados
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {products.length}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <MarketplaceCategorySection
            categories={categories}
            hrefState={hrefState}
            selectedCategorySlug={categorySlug}
          />

          <MarketplaceFiltersPanel
            activeCountryName={countryForQuery}
            hrefState={hrefState}
          />

          {products.length > 0 ? (
            <CatalogProductSections
              favoriteProductIds={favoriteProductIds}
              sections={categorySections}
              viewerId={viewerId}
            />
          ) : (
            <CatalogEmptyState countryName={countryForQuery} />
          )}
        </div>
      </section>
    </main>
  );
}
