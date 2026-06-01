import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Category } from "@/types";

import { getCategoryIcon } from "./categoryIconMap";

type CategoryPreviewProps = Readonly<{
  categories: Category[];
  countByCategoryId: ReadonlyMap<string, number>;
}>;

export function CategoryPreview({
  categories,
  countByCategoryId,
}: CategoryPreviewProps) {
  return (
    <section className="py-8" id="explora-categorias">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                Comprar por categoría
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Navega como en un marketplace clásico: elige categoría y filtra
                productos.
              </p>
            </div>
            <Link
              className="hidden items-center gap-0.5 text-sm font-semibold text-brand hover:underline sm:inline-flex"
              href="/marketplace"
            >
              Ver todo
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-base font-semibold text-slate-800">
                Aún no hay categorías para mostrar
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Cuando existan categorías activas, aparecerán aquí
                automáticamente.
              </p>
              <Link
                className="mt-6 inline-flex text-sm font-bold text-brand underline-offset-2 hover:underline"
                href="/marketplace"
              >
                Ir al marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4 lg:grid-cols-8">
              {categories.map((category) => (
                <CategoryTile
                  category={category}
                  count={countByCategoryId.get(category.id) ?? 0}
                  key={category.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  count,
}: Readonly<{ category: Category; count: number }>) {
  const Icon = getCategoryIcon(category.icon);
  const countLabel =
    count === 0
      ? "Sin productos"
      : `${count} producto${count === 1 ? "" : "s"}`;

  return (
    <Link
      className="group flex flex-col items-center bg-white px-3 py-5 text-center transition hover:bg-brand-light"
      href={`/marketplace?categoria=${encodeURIComponent(category.slug)}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-brand-muted group-hover:text-slate-900">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="mt-3 line-clamp-2 text-xs font-bold text-slate-900 sm:text-sm">
        {category.name}
      </h3>
      <p className="mt-1 text-[11px] text-slate-500">{countLabel}</p>
    </Link>
  );
}
