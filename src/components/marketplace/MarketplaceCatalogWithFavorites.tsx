import { CatalogEmptyState, MarketplaceProductGrid } from "@/components/marketplace";
import type { ProductCardItem } from "@/features/products/types";
import type { MarketplaceHrefValues } from "@/lib/marketplaceFilters";
import { getBuyerPurchaseContext } from "@/services/supabase/account/buyerPurchaseContext";
import { getAuthenticatedUser } from "@/services/supabase/auth/getAuthenticatedUser";
import { getFavoriteProductIds } from "@/services/supabase/favorites/favoriteService";
import { createSupabaseServerClient } from "@/services/supabase/server";

type MarketplaceCatalogWithFavoritesProps = Readonly<{
  countryName?: string;
  hrefState: MarketplaceHrefValues;
  page: number;
  products: ReadonlyArray<ProductCardItem>;
  totalPages: number;
  totalProducts: number;
}>;

export async function MarketplaceCatalogWithFavorites({
  countryName,
  hrefState,
  page,
  products,
  totalPages,
  totalProducts,
}: MarketplaceCatalogWithFavoritesProps) {
  const user = await getAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  const buyerPurchaseContext =
    user && supabase
      ? await getBuyerPurchaseContext(supabase, user.id)
      : { isBuyer: false, shippingComplete: false };
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

  if (totalProducts === 0) {
    return <CatalogEmptyState countryName={countryName} />;
  }

  return (
    <MarketplaceProductGrid
      buyerPurchaseContext={buyerPurchaseContext}
      favoriteProductIds={favoriteProductIds}
      hrefState={hrefState}
      page={page}
      products={products}
      totalPages={totalPages}
      totalProducts={totalProducts}
      viewerId={user?.id ?? null}
    />
  );
}
