import {
  CatalogEmptyState,
  CatalogProductSections,
} from "@/components/marketplace";
import type { MarketplaceCategorySection } from "@/features/products";
import type { ProductCardItem } from "@/features/products/types";
import type { MarketplaceHrefValues } from "@/lib/marketplaceFilters";
import { getAuthenticatedUser } from "@/services/supabase/auth/getAuthenticatedUser";
import { getFavoriteProductIds } from "@/services/supabase/favorites/favoriteService";
import { createSupabaseServerClient } from "@/services/supabase/server";

type MarketplaceCatalogWithFavoritesProps = Readonly<{
  countryName?: string;
  hrefState: MarketplaceHrefValues;
  products: ReadonlyArray<ProductCardItem>;
  sections: ReadonlyArray<MarketplaceCategorySection>;
}>;

export async function MarketplaceCatalogWithFavorites({
  countryName,
  hrefState,
  products,
  sections,
}: MarketplaceCatalogWithFavoritesProps) {
  const user = await getAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  const favoriteProductIds =
    user && supabase
      ? [
          ...(await getFavoriteProductIds(
            supabase,
            user.id,
            products.map((product) => product.id),
          )),
        ]
      : [];

  if (products.length === 0) {
    return <CatalogEmptyState countryName={countryName} />;
  }

  return (
    <CatalogProductSections
      favoriteProductIds={favoriteProductIds}
      hrefState={hrefState}
      sections={[...sections]}
      viewerId={user?.id ?? null}
    />
  );
}
