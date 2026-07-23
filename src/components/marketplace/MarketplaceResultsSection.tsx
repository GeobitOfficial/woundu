import { redirect } from "next/navigation";

import { getMarketplaceProducts } from "@/features/products";
import { MARKETPLACE_PAGE_SIZE } from "@/features/products/marketplaceConstants";
import type { MarketplaceHrefValues } from "@/lib/marketplaceFilters";
import { toMarketplaceHref } from "@/lib/marketplaceFilters";
import type { Category } from "@/types";

import { MarketplaceCatalogWithFavorites } from "./MarketplaceCatalogWithFavorites";

type MarketplaceResultsSectionProps = Readonly<{
  activeCountryName?: string;
  categories: Category[];
  hrefState: MarketplaceHrefValues;
}>;

export async function MarketplaceResultsSection({
  activeCountryName,
  categories,
  hrefState,
}: MarketplaceResultsSectionProps) {
  const products = await getMarketplaceProducts({
    categorySlug: hrefState.categorySlug,
    country: activeCountryName,
    search: hrefState.search,
    minPrice: hrefState.minPrice,
    maxPrice: hrefState.maxPrice,
    minStars: hrefState.minStars,
    onSaleOnly: hrefState.onSaleOnly,
    onlineOnly: hrefState.onlineOnly,
    sortBy: hrefState.sortBy,
  });

  const totalProducts = products.length;
  const totalPages =
    totalProducts === 0 ? 0 : Math.ceil(totalProducts / MARKETPLACE_PAGE_SIZE);
  const requestedPage = hrefState.page ?? 1;

  if (totalPages > 0 && requestedPage > totalPages) {
    redirect(
      toMarketplaceHref({
        ...hrefState,
        page: totalPages,
      }),
    );
  }

  const pageStart = (requestedPage - 1) * MARKETPLACE_PAGE_SIZE;
  const paginatedProducts = products.slice(
    pageStart,
    pageStart + MARKETPLACE_PAGE_SIZE,
  );

  return (
    <MarketplaceCatalogWithFavorites
      countryName={activeCountryName}
      hrefState={hrefState}
      page={requestedPage}
      products={paginatedProducts}
      totalPages={totalPages}
      totalProducts={totalProducts}
    />
  );
}
