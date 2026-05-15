import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  toMarketplaceHref,
  type MarketplaceHrefValues,
} from "@/lib/marketplaceFilters";
import type { Category } from "@/types";

type MarketplaceCategorySectionProps = Readonly<{
  categories: Category[];
  hrefState: MarketplaceHrefValues;
  selectedCategorySlug?: string;
}>;

/**
 * Lista principal de categorías del marketplace (ancla `#categorias`).
 * Diseño en cuadrícula para que sea visible en móvil y escritorio.
 */
export function MarketplaceCategorySection({
  categories,
  hrefState,
  selectedCategorySlug,
}: MarketplaceCategorySectionProps) {
  const allHref = toMarketplaceHref({
    ...hrefState,
    categorySlug: undefined,
  });

  return (
    <section
      aria-labelledby="marketplace-categorias-heading"
      className="scroll-mt-28 rounded-[2rem] border border-emerald-100/60 bg-white/95 p-5 shadow-sm shadow-emerald-900/10 backdrop-blur-sm sm:p-6"
      id="categorias"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Catálogo
          </p>
          <h2
            className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
            id="marketplace-categorias-heading"
          >
            Categorías
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Elige una categoría para filtrar los productos. Puedes combinarlo
            después con país, búsqueda y filtros avanzados.
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          Aún no hay categorías activas. Cuando el administrador las configure,
          aparecerán aquí.
        </p>
      ) : (
        <nav
          aria-label="Lista de categorías para filtrar productos"
          className="mt-6"
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <li>
              <Link
                className={cn(
                  "flex h-full min-h-[5.5rem] flex-col justify-center rounded-2xl border-2 px-4 py-3 text-center text-sm font-bold transition sm:min-h-[6.5rem] sm:px-4 sm:py-4",
                  !selectedCategorySlug
                    ? "border-slate-950 bg-slate-950 text-white shadow-md"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-400 hover:bg-white",
                )}
                href={allHref}
              >
                Todas
              </Link>
            </li>
            {categories.map((category) => {
              const href = toMarketplaceHref({
                ...hrefState,
                categorySlug: category.slug,
              });
              const selected = selectedCategorySlug === category.slug;

              return (
                <li key={category.id}>
                  <Link
                    className={cn(
                      "flex h-full min-h-[5.5rem] flex-col justify-center rounded-2xl border-2 px-4 py-3 text-center transition sm:min-h-[6.5rem] sm:py-4",
                      selected
                        ? "border-slate-950 bg-slate-950 text-white shadow-md"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/60",
                    )}
                    href={href}
                  >
                    <span className="text-sm font-bold leading-snug sm:text-base">
                      {category.name}
                    </span>
                    {category.description ? (
                      <span
                        className={cn(
                          "mt-1 line-clamp-2 text-xs leading-snug sm:line-clamp-3",
                          selected ? "text-slate-300" : "text-slate-500",
                        )}
                      >
                        {category.description}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </section>
  );
}
