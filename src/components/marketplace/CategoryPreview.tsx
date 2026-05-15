import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Category } from "@/types";

type CategoryPreviewProps = Readonly<{
  categories: Category[];
  countByCategoryId: ReadonlyMap<string, number>;
}>;

export function CategoryPreview({
  categories,
  countByCategoryId,
}: CategoryPreviewProps) {
  return (
    <section
      className="bg-gradient-to-br from-violet-100/55 via-emerald-50/70 to-cyan-100/50 py-20"
      id="explora-categorias"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              Categorías
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Explora el marketplace por intereses.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Datos en vivo desde el catálogo: categorías activas y cantidad de
            publicaciones por cada una.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-emerald-200/70 bg-white/85 px-6 py-12 text-center shadow-sm shadow-emerald-900/5 backdrop-blur-sm">
            <p className="text-base font-semibold text-slate-800">
              Aún no hay categorías para mostrar
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Cuando existan categorías activas en el marketplace, aparecerán
              aquí automáticamente.
            </p>
            <Link
              className="mt-6 inline-flex text-sm font-bold text-emerald-700 underline-offset-2 hover:underline"
              href="/marketplace"
            >
              Ir al marketplace
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const count = countByCategoryId.get(category.id) ?? 0;
              const badge = String(index + 1).padStart(2, "0");
              const countLabel =
                count === 0
                  ? "Sin publicaciones aún"
                  : `${count} producto${count === 1 ? "" : "s"}`;

              return (
                <Link
                  className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  href={`/marketplace?categoria=${encodeURIComponent(category.slug)}`}
                  key={category.id}
                >
                  <div className="h-36 bg-gradient-to-br from-slate-950 via-slate-800 to-emerald-500 p-4">
                    <div className="flex h-full items-start justify-end">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        {badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {category.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {category.description ??
                            "Explora publicaciones en esta categoría."}
                        </p>
                      </div>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-emerald-600"
                      />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-slate-950">
                      {countLabel}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
