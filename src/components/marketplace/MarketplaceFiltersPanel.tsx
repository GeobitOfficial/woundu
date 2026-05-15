import Link from "next/link";

import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  toMarketplaceHref,
  type MarketplaceHrefValues,
} from "@/lib/marketplaceFilters";

type MarketplaceFiltersPanelProps = Readonly<{
  hrefState: MarketplaceHrefValues;
  activeCountryName?: string;
}>;

export function MarketplaceFiltersPanel({
  hrefState,
  activeCountryName,
}: MarketplaceFiltersPanelProps) {
  const clearAdvancedHref = toMarketplaceHref({
    categorySlug: hrefState.categorySlug,
    search: hrefState.search,
    countrySlug: hrefState.countrySlug,
  });

  const hasAdvanced =
    hrefState.minPrice != null ||
    hrefState.maxPrice != null ||
    (hrefState.minStars != null && hrefState.minStars >= 1) ||
    hrefState.onSaleOnly;

  return (
    <section className="rounded-[2rem] border border-cyan-100/70 bg-white/95 p-4 shadow-sm shadow-cyan-900/10 backdrop-blur-sm">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Filtros
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Búsqueda, precio, calificación por estrellas y ofertas. Se combinan
            con la categoría elegida arriba y el país en la barra superior.
          </p>
        </div>
        {activeCountryName ? (
          <p className="text-sm text-slate-700 sm:text-right">
            <span className="font-semibold text-slate-950">País:</span>{" "}
            {activeCountryName}
            <span className="mx-2 text-slate-300" aria-hidden="true">
              ·
            </span>
            <Link
              className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
              href={toMarketplaceHref({
                categorySlug: hrefState.categorySlug,
                search: hrefState.search,
                countrySlug: undefined,
                minPrice: hrefState.minPrice,
                maxPrice: hrefState.maxPrice,
                minStars: hrefState.minStars,
                onSaleOnly: hrefState.onSaleOnly,
              })}
            >
              Ver todos los países
            </Link>
          </p>
        ) : (
          <p className="max-w-sm text-sm text-slate-600 sm:text-right">
            <span className="font-semibold text-slate-800">País:</span> elige uno
            en la barra superior para acotar por región.
          </p>
        )}
      </div>

      <form action="/marketplace" className="space-y-5" method="get">
        {hrefState.categorySlug ? (
          <input name="categoria" type="hidden" value={hrefState.categorySlug} />
        ) : null}
        {hrefState.countrySlug ? (
          <input name="pais" type="hidden" value={hrefState.countrySlug} />
        ) : null}

        <div className="flex flex-col gap-3">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Buscar
            </span>
            <input
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
              defaultValue={hrefState.search ?? ""}
              name="q"
              placeholder="Palabras clave en título o descripción"
              type="search"
            />
          </label>
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Precio mínimo
            </span>
            <input
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
              defaultValue={
                hrefState.minPrice != null ? String(hrefState.minPrice) : ""
              }
              inputMode="decimal"
              min="0"
              name="min_precio"
              placeholder="0"
              step="0.01"
              type="number"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Precio máximo
            </span>
            <input
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
              defaultValue={
                hrefState.maxPrice != null ? String(hrefState.maxPrice) : ""
              }
              inputMode="decimal"
              min="0"
              name="max_precio"
              placeholder="Sin tope"
              step="0.01"
              type="number"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Calificación mínima
            </span>
            <select
              className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
              defaultValue={
                hrefState.minStars != null && hrefState.minStars >= 1
                  ? String(hrefState.minStars)
                  : ""
              }
              name="min_estrellas"
            >
              <option value="">Cualquiera</option>
              <option value="5">5 estrellas o más</option>
              <option value="4">4 estrellas o más</option>
              <option value="3">3 estrellas o más</option>
              <option value="2">2 estrellas o más</option>
              <option value="1">1 estrella o más</option>
            </select>
          </label>
          <div className="flex flex-col justify-end space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">
              Solo ofertas
            </span>
            <span className="flex items-center gap-2">
              <input
                className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                defaultChecked={hrefState.onSaleOnly}
                id="solo_ofertas"
                name="solo_ofertas"
                type="checkbox"
                value="1"
              />
              <label className="text-sm text-slate-600" htmlFor="solo_ofertas">
                Mostrar solo productos en oferta
              </label>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <button className={cn(buttonVariants({ variant: "primary" }))} type="submit">
            Aplicar búsqueda y filtros
          </button>
          {hasAdvanced ? (
            <Link
              className="text-sm font-semibold text-slate-600 underline-offset-2 hover:text-slate-950 hover:underline"
              href={clearAdvancedHref}
            >
              Quitar precio, estrellas y ofertas
            </Link>
          ) : null}
        </div>
      </form>
    </section>
  );
}
