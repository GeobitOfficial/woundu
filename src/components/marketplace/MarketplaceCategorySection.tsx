import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  toMarketplaceHref,
  type MarketplaceHrefValues,
} from "@/lib/marketplaceFilters";
import type { Category } from "@/types";

import { getCategoryIcon } from "./categoryIconMap";

type MarketplaceCategorySectionProps = Readonly<{
  categories: Category[];
  hrefState: MarketplaceHrefValues;
  selectedCategorySlug?: string;
  productCountByCategoryId: ReadonlyMap<string, number>;
  totalProductCount: number;
}>;

export function MarketplaceCategorySection({
  categories,
  hrefState,
  productCountByCategoryId,
  selectedCategorySlug,
  totalProductCount,
}: MarketplaceCategorySectionProps) {
  const allHref = toMarketplaceHref({
    ...hrefState,
    categorySlug: undefined,
  });

  return (
    <section
      aria-labelledby="marketplace-categorias-heading"
      className="scroll-mt-28 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
      id="categorias"
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-brand-light/60 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">
              Departamentos
            </p>
            <h2
              className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl"
              id="marketplace-categorias-heading"
            >
              Comprar por categoría
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {totalProductCount}{" "}
              {totalProductCount === 1
                ? "producto disponible"
                : "productos disponibles"}
              . Elige un departamento para filtrar el catálogo.
            </p>
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand hover:underline"
            href={allHref}
          >
            Ver todas las categorías
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-600">
          Aún no hay categorías activas. Cuando el administrador las configure,
          aparecerán aquí.
        </p>
      ) : (
        <nav
          aria-label="Filtrar productos por categoría"
          className="p-4 sm:p-5"
        >
          <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <li className="shrink-0">
              <CategoryPill
                count={totalProductCount}
                href={allHref}
                label="Todas"
                selected={!selectedCategorySlug}
              />
            </li>
            {categories.map((category) => {
              const count = productCountByCategoryId.get(category.id) ?? 0;
              const href = toMarketplaceHref({
                ...hrefState,
                categorySlug: category.slug,
              });

              return (
                <li className="shrink-0" key={category.id}>
                  <CategoryPill
                    count={count}
                    href={href}
                    iconName={category.icon}
                    label={category.name}
                    selected={selectedCategorySlug === category.slug}
                  />
                </li>
              );
            })}
          </ul>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              const count = productCountByCategoryId.get(category.id) ?? 0;
              const href = toMarketplaceHref({
                ...hrefState,
                categorySlug: category.slug,
              });
              const selected = selectedCategorySlug === category.slug;

              return (
                <Link
                  className={cn(
                    "group flex items-center gap-3 rounded-sm border p-3 transition",
                    selected
                      ? "border-brand bg-brand-light"
                      : "border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white",
                  )}
                  href={href}
                  key={category.id}
                >
                  <CategoryGridIcon Icon={Icon} selected={selected} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 group-hover:text-brand">
                      {category.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {count} {count === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </section>
  );
}

function CategoryPill({
  count,
  href,
  iconName,
  label,
  selected,
}: Readonly<{
  href: string;
  label: string;
  count: number;
  selected: boolean;
  iconName?: string | null;
}>) {
  const Icon = iconName ? getCategoryIcon(iconName) : null;

  return (
    <Link
      className={cn(
        "flex min-w-[7.5rem] flex-col items-center rounded-sm border px-3 py-3 text-center transition sm:min-w-[8.5rem]",
        selected
          ? "border-slate-900 bg-slate-900 text-white shadow-md"
          : "border-slate-200 bg-white text-slate-800 hover:border-brand/40 hover:bg-brand-light",
      )}
      href={href}
    >
      {Icon ? (
        <Icon
          aria-hidden="true"
          className={cn(
            "h-5 w-5",
            selected ? "text-brand" : "text-slate-600",
          )}
        />
      ) : null}
      <span className="mt-2 text-xs font-bold leading-tight sm:text-sm">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 text-[11px]",
          selected ? "text-slate-300" : "text-slate-500",
        )}
      >
        {count} {count === 1 ? "producto" : "productos"}
      </span>
    </Link>
  );
}

function CategoryGridIcon({
  Icon,
  selected,
}: Readonly<{
  Icon: ReturnType<typeof getCategoryIcon>;
  selected: boolean;
}>) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        selected ? "bg-brand-muted text-slate-900" : "bg-white text-slate-600",
      )}
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </div>
  );
}
