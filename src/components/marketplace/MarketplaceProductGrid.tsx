import { MARKETPLACE_PAGE_SIZE } from "@/features/products/marketplaceConstants";
import type { ProductCardItem } from "@/features/products";
import type { MarketplaceHrefValues } from "@/lib/marketplaceFilters";

import { MarketplaceCatalogPagination } from "./MarketplaceCatalogPagination";
import { ProductCard } from "./ProductCard";

type MarketplaceProductGridProps = Readonly<{
  buyerPurchaseContext?: Readonly<{
    isBuyer: boolean;
    shippingComplete: boolean;
  }>;
  favoriteProductIds: ReadonlyArray<string>;
  hrefState: MarketplaceHrefValues;
  page: number;
  products: ReadonlyArray<ProductCardItem>;
  totalPages: number;
  totalProducts: number;
  viewerId: string | null;
}>;

export function MarketplaceProductGrid({
  buyerPurchaseContext,
  favoriteProductIds,
  hrefState,
  page,
  products,
  totalPages,
  totalProducts,
  viewerId,
}: MarketplaceProductGridProps) {
  const rangeStart =
    totalProducts === 0 ? 0 : (page - 1) * MARKETPLACE_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * MARKETPLACE_PAGE_SIZE, totalProducts);

  return (
    <section
      aria-label="Resultados del marketplace"
      className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
        <p className="text-sm text-slate-600">
          {totalProducts === 0 ? (
            "Sin productos"
          ) : (
            <>
              Mostrando{" "}
              <span className="font-bold text-slate-900">
                {rangeStart}-{rangeEnd}
              </span>{" "}
              de{" "}
              <span className="font-bold text-slate-900">{totalProducts}</span>{" "}
              productos
            </>
          )}
        </p>
        {totalPages > 1 ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pagina {page} / {totalPages}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard
            buyerPurchaseContext={buyerPurchaseContext}
            initialFavorited={favoriteProductIds.includes(product.id)}
            key={product.id}
            product={product}
            viewerId={viewerId}
          />
        ))}
      </div>

      <MarketplaceCatalogPagination
        hrefState={hrefState}
        page={page}
        totalPages={totalPages}
      />
    </section>
  );
}
