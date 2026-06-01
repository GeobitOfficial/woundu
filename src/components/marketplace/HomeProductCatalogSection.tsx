import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { ProductCardItem } from "@/features/products";
import {
  formatProductPrice,
  getProductDiscountPercent,
  getProductMarketplaceHref,
} from "@/utils/productDisplay";

import { ProductRatingStars } from "./ProductRatingStars";
import { ProductThumbnail } from "./ProductThumbnail";

const CATALOG_DISPLAY_LIMIT = 18;

type HomeProductCatalogSectionProps = Readonly<{
  products: ReadonlyArray<ProductCardItem>;
}>;

export function HomeProductCatalogSection({
  products,
}: HomeProductCatalogSectionProps) {
  const visibleProducts = products.slice(0, CATALOG_DISPLAY_LIMIT);

  return (
    <section
      aria-labelledby="home-catalog-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      id="catalogo-productos"
    >
      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2
            className="text-lg font-bold text-slate-950 sm:text-xl"
            id="home-catalog-heading"
          >
            Recomendados para ti
          </h2>
          <Link
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand hover:text-brand-dark hover:underline"
            href="/marketplace"
          >
            Ver todo
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-base font-semibold text-slate-800">
              Aún no hay productos para mostrar
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Cuando existan publicaciones activas, verás aquí precio y
              calificación de cada una.
            </p>
            <Link
              className="mt-6 inline-flex rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-brand"
              href="/publicar"
            >
              Publicar el primero
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {visibleProducts.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CatalogProductCard({ product }: Readonly<{ product: ProductCardItem }>) {
  const href = getProductMarketplaceHref(product);
  const discount = getProductDiscountPercent(product);

  return (
    <Link
      className="group flex h-full flex-col border-b border-r border-slate-100 bg-white transition hover:bg-slate-50"
      href={href}
    >
      <ProductThumbnail
        className="aspect-square p-3"
        product={product}
      />

      <div className="flex flex-1 flex-col p-3">
        {product.category ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {product.category.name}
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-slate-900 group-hover:text-brand">
          {product.title}
        </h3>

        <div className="mt-3">
          {product.isOnOffer && product.compareAtPrice != null ? (
            <p className="text-xs text-slate-400 line-through">
              {formatProductPrice(product.compareAtPrice, product.currency)}
            </p>
          ) : null}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-xl font-semibold text-slate-950">
              {formatProductPrice(product.price, product.currency)}
            </p>
            {discount != null ? (
              <span className="rounded-sm bg-brand-muted px-1.5 py-0.5 text-xs font-bold text-brand-dark">
                -{discount}%
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <ProductRatingStars
            ratingAverage={product.ratingAverage}
            reviewCount={product.reviewCount}
          />
        </div>
      </div>
    </Link>
  );
}
