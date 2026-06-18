import type { AccountFavoriteProductView } from "@/features/account/types";
import { toMarketplaceHref } from "@/lib/marketplaceFilters";

export function getFavoriteProductHref(item: AccountFavoriteProductView): string {
  if (item.slug) {
    return `/marketplace/${item.slug}`;
  }

  return toMarketplaceHref({ search: item.title });
}
