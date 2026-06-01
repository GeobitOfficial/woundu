import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { MarketplaceCategorySection } from "@/features/products";
import {
  toMarketplaceHref,
  type MarketplaceHrefValues,
} from "@/lib/marketplaceFilters";

import { getCategoryIcon } from "./categoryIconMap";
import { ProductCard } from "./ProductCard";

type CatalogProductSectionsProps = Readonly<{
  favoriteProductIds: ReadonlyArray<string>;
  hrefState: MarketplaceHrefValues;
  sections: MarketplaceCategorySection[];
  viewerId: string | null;
}>;

export function CatalogProductSections({
  favoriteProductIds,
  hrefState,
  sections,
  viewerId,
}: CatalogProductSectionsProps) {
  if (sections.length === 0) {
    return null;
  }

  const showJumpNav = sections.length >= 2;

  return (
    <div className="space-y-6" id="productos-por-categoria">
      {showJumpNav ? (
        <nav
          aria-label="Ir a una categoría del catálogo"
          className="sticky top-16 z-40 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Saltar a categoría
            </p>
          </div>
          <ul className="flex gap-2 overflow-x-auto p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((section) => (
              <li className="shrink-0" key={section.key}>
                <a
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand/40 hover:bg-brand-light hover:text-brand-dark"
                  href={`#cat-${section.key}`}
                >
                  {section.title}
                  <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                    {section.products.length}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="space-y-6">
        {sections.map((section) => (
          <CategoryProductBlock
            favoriteProductIds={favoriteProductIds}
            hrefState={hrefState}
            key={section.key}
            section={section}
            viewerId={viewerId}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryProductBlock({
  favoriteProductIds,
  hrefState,
  section,
  viewerId,
}: Readonly<{
  favoriteProductIds: ReadonlyArray<string>;
  hrefState: MarketplaceHrefValues;
  section: MarketplaceCategorySection;
  viewerId: string | null;
}>) {
  const Icon = getCategoryIcon(section.icon);
  const categoryHref =
    section.slug != null
      ? toMarketplaceHref({ ...hrefState, categorySlug: section.slug })
      : toMarketplaceHref(hrefState);

  return (
    <section
      aria-labelledby={`heading-cat-${section.key}`}
      className="scroll-mt-36 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
      id={`cat-${section.key}`}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-dark">
            <Icon aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <h2
              className="text-xl font-bold text-slate-950 sm:text-2xl"
              id={`heading-cat-${section.key}`}
            >
              {section.title}
            </h2>
            {section.description ? (
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                {section.description}
              </p>
            ) : null}
            <p className="mt-2 text-sm font-medium text-slate-700">
              {section.products.length}{" "}
              {section.products.length === 1 ? "producto" : "productos"} en esta
              categoría
            </p>
          </div>
        </div>
        {section.slug ? (
          <Link
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand hover:underline"
            href={categoryHref}
          >
            Ver solo {section.title}
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4">
        {section.products.map((product) => (
          <ProductCard
            initialFavorited={favoriteProductIds.includes(product.id)}
            key={product.id}
            product={product}
            viewerId={viewerId}
          />
        ))}
      </div>
    </section>
  );
}
