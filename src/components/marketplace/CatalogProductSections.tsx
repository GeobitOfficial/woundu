import type { MarketplaceCategorySection } from "@/features/products";

import { ProductCard } from "./ProductCard";

type CatalogProductSectionsProps = Readonly<{
  favoriteProductIds: ReadonlyArray<string>;
  sections: MarketplaceCategorySection[];
  viewerId: string | null;
}>;

export function CatalogProductSections({
  favoriteProductIds,
  sections,
  viewerId,
}: CatalogProductSectionsProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div>
      {sections.length >= 2 ? (
        <nav
          aria-label="Ir a una categoría en la página"
          className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-violet-100/60 bg-white/95 p-3 shadow-sm shadow-violet-900/10 backdrop-blur-sm"
        >
          {sections.map((section) => (
            <a
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
              href={`#${section.key}`}
              key={section.key}
            >
              {section.title}
            </a>
          ))}
        </nav>
      ) : null}

      <div className="space-y-12">
        {sections.map((section) => (
          <section
            className="scroll-mt-28"
            id={section.key}
            key={section.key}
          >
            <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {section.products.length}{" "}
              {section.products.length === 1 ? "producto" : "productos"}
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        ))}
      </div>
    </div>
  );
}
