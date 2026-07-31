"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Star, X } from "lucide-react";

import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  toMarketplaceHref,
  type MarketplaceHrefValues,
} from "@/lib/marketplaceFilters";
import type { Category } from "@/types";

type MarketplaceFiltersPanelProps = Readonly<{
  hrefState: MarketplaceHrefValues;
  activeCountryName?: string;
  categories?: ReadonlyArray<Category>;
}>;

export function MarketplaceFiltersPanel({
  hrefState,
  activeCountryName,
  categories = [],
}: MarketplaceFiltersPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false); // Control del menú móvil colapsable

  const [search, setSearch] = useState(hrefState.search ?? "");
  const [minPrice, setMinPrice] = useState(
    hrefState.minPrice != null ? String(hrefState.minPrice) : "",
  );
  const [maxPrice, setMaxPrice] = useState(
    hrefState.maxPrice != null ? String(hrefState.maxPrice) : "",
  );
  const [minStars, setMinStars] = useState(
    hrefState.minStars != null && hrefState.minStars >= 1
      ? String(hrefState.minStars)
      : "",
  );
  const [onSaleOnly, setOnSaleOnly] = useState(Boolean(hrefState.onSaleOnly));
  const [onlineOnly, setOnlineOnly] = useState(Boolean(hrefState.onlineOnly));
  const [sortBy, setSortBy] = useState(hrefState.sortBy ?? "recent");

  useEffect(() => {
    setSearch(hrefState.search ?? "");
    setMinPrice(hrefState.minPrice != null ? String(hrefState.minPrice) : "");
    setMaxPrice(hrefState.maxPrice != null ? String(hrefState.maxPrice) : "");
    setMinStars(
      hrefState.minStars != null && hrefState.minStars >= 1
        ? String(hrefState.minStars)
        : "",
    );
    setOnSaleOnly(Boolean(hrefState.onSaleOnly));
    setOnlineOnly(Boolean(hrefState.onlineOnly));
    setSortBy(hrefState.sortBy ?? "recent");
  }, [
    hrefState.maxPrice,
    hrefState.minPrice,
    hrefState.minStars,
    hrefState.onSaleOnly,
    hrefState.onlineOnly,
    hrefState.search,
    hrefState.sortBy,
  ]);

  const clearAdvancedHref = toMarketplaceHref({
    categorySlug: hrefState.categorySlug,
    search: hrefState.search,
    countrySlug: hrefState.countrySlug,
    sortBy: "recent",
  });

  const hasAdvanced =
    hrefState.minPrice != null ||
    hrefState.maxPrice != null ||
    (hrefState.minStars != null && hrefState.minStars >= 1) ||
    hrefState.onSaleOnly ||
    hrefState.onlineOnly ||
    (hrefState.sortBy != null && hrefState.sortBy !== "recent");

  function buildHref(next?: Partial<MarketplaceHrefValues>) {
    return toMarketplaceHref({
      categorySlug: hrefState.categorySlug,
      countrySlug: hrefState.countrySlug,
      search: hrefState.search,
      minPrice: hrefState.minPrice,
      maxPrice: hrefState.maxPrice,
      minStars: hrefState.minStars,
      onSaleOnly: hrefState.onSaleOnly,
      onlineOnly: hrefState.onlineOnly,
      sortBy: hrefState.sortBy,
      ...next,
    });
  }

  function navigate(next?: Partial<MarketplaceHrefValues>) {
    const mergedState = {
      categorySlug: hrefState.categorySlug,
      countrySlug: hrefState.countrySlug,
      search: hrefState.search,
      minPrice: hrefState.minPrice,
      maxPrice: hrefState.maxPrice,
      minStars: hrefState.minStars,
      onSaleOnly: hrefState.onSaleOnly,
      onlineOnly: hrefState.onlineOnly,
      sortBy: hrefState.sortBy,
      ...next,
    };

    // Si no queda ningún filtro de búsqueda activo, redirigir al Home "/"
    const hasActiveFilters =
      Boolean(mergedState.categorySlug) ||
      Boolean(mergedState.search) ||
      mergedState.minPrice != null ||
      mergedState.maxPrice != null ||
      (mergedState.minStars != null && mergedState.minStars >= 1) ||
      mergedState.onSaleOnly ||
      mergedState.onlineOnly;

    const targetUrl = hasActiveFilters
      ? toMarketplaceHref({ ...mergedState, page: undefined })
      : "/";

    startTransition(() => {
      if (targetUrl === "/") {
        router.push("/");
      } else {
        router.replace(targetUrl);
      }
    });
  }

  function parseNumber(value: string) {
    if (value.trim() === "") {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  function applySearchAndPriceFilters() {
    navigate({
      search: search.trim() || undefined,
      minPrice: parseNumber(minPrice),
      maxPrice: parseNumber(maxPrice),
      minStars: minStars.trim() === "" ? undefined : Number(minStars),
      onSaleOnly,
      onlineOnly,
      sortBy:
        sortBy === "recent"
          ? undefined
          : (sortBy as MarketplaceHrefValues["sortBy"]),
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearchAndPriceFilters();
  }

  function resetAdvancedFilters() {
    setMinPrice("");
    setMaxPrice("");
    setMinStars("");
    setOnSaleOnly(false);
    setOnlineOnly(false);
    setSortBy("recent");
    navigate({
      minPrice: undefined,
      maxPrice: undefined,
      minStars: undefined,
      onSaleOnly: undefined,
      onlineOnly: undefined,
      sortBy: undefined,
    });
  }

  return (
    <div className="w-full">
      
      {/* Botón de Filtros para Móviles */}
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-black text-slate-950 shadow-md transition hover:bg-brand-hover"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {isOpen ? "Ocultar filtros y categorías" : "Filtrar y Ordenar productos"}
        </button>
      </div>

      {/* Contenedor de la Barra Lateral */}
      <section
        className={cn(
          "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 lg:block",
          isOpen ? "block" : "hidden"
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. CATEGORÍAS (DEPARTAMENTOS) */}
          {categories.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Categorías
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href={toMarketplaceHref({ ...hrefState, categorySlug: undefined, page: undefined })}
                  className={cn(
                    "text-xs font-bold transition hover:text-brand",
                    !hrefState.categorySlug ? "text-brand" : "text-slate-600"
                  )}
                >
                  Todas las categorías
                </Link>
                {categories.map((cat) => {
                  const isActive = hrefState.categorySlug === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={toMarketplaceHref({ ...hrefState, categorySlug: cat.slug, page: undefined })}
                      className={cn(
                        "text-xs transition hover:text-brand pl-2 border-l border-slate-200 hover:border-brand",
                        isActive ? "text-brand font-black border-brand" : "text-slate-500 font-semibold"
                      )}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ORDENAR POR */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Ordenar por
            </h3>
            <select
              className="h-10 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              onChange={(event) => {
                const nextSortBy = event.target.value as
                  | "recent"
                  | "price_asc"
                  | "price_desc"
                  | "rating";
                setSortBy(nextSortBy);
                navigate({
                  sortBy: nextSortBy === "recent" ? undefined : nextSortBy,
                });
              }}
              value={sortBy}
            >
              <option value="recent">Más recientes</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="rating">Mejor calificados</option>
            </select>
          </div>

          {/* 4. RANGO DE PRECIO */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Rango de precio
            </h3>
            <div className="flex gap-2 items-center">
              <input
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                inputMode="decimal"
                min="0"
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Mínimo"
                type="number"
                value={minPrice}
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                inputMode="decimal"
                min="0"
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Máximo"
                type="number"
                value={maxPrice}
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 h-10 text-xs font-bold transition shadow-sm"
              >
                Ir
              </button>
            </div>
          </div>

          {/* 5. FILTROS RÁPIDOS */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Opciones
            </h3>
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => {
                    setOnSaleOnly(e.target.checked);
                    navigate({ onSaleOnly: e.target.checked ? true : undefined });
                  }}
                  className="rounded text-brand focus:ring-brand h-4 w-4 border-slate-300"
                />
                Solo ofertas
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => {
                    setOnlineOnly(e.target.checked);
                    navigate({ onlineOnly: e.target.checked ? true : undefined });
                  }}
                  className="rounded text-brand focus:ring-brand h-4 w-4 border-slate-300"
                />
                Solo pago online
              </label>
            </div>
          </div>

          {/* 6. CALIFICACIÓN */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Calificación promedio
            </h3>
            <div className="flex flex-col gap-1.5">
              {([5, 4, 3, 2, 1] as const).map((stars) => {
                const isActive = minStars === String(stars);
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => {
                      const nextValue = isActive ? "" : String(stars);
                      setMinStars(nextValue);
                      navigate({ minStars: nextValue ? Number(nextValue) : undefined });
                    }}
                    className="flex items-center gap-1 hover:opacity-80 transition text-left"
                  >
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <Star
                          key={index}
                          className={cn(
                            "h-3.5 w-3.5",
                            index <= stars
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 fill-slate-200"
                          )}
                        />
                      ))}
                    </div>
                    {stars < 5 && (
                      <span
                        className={cn(
                          "text-[10px] font-bold ml-1",
                          isActive ? "text-brand" : "text-slate-500"
                        )}
                      >
                        o más
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. FILTROS ACTIVOS */}
          {(hasAdvanced || hrefState.search?.trim()) && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Filtros activos
                </h3>
                <button
                  onClick={resetAdvancedFilters}
                  type="button"
                  className="text-[10px] font-extrabold uppercase text-brand hover:underline"
                >
                  Limpiar todos
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hrefState.search?.trim() && (
                  <ActiveChip
                    label={`Busca: ${hrefState.search}`}
                    onClear={() => {
                      setSearch("");
                      navigate({ search: undefined });
                    }}
                  />
                )}
                {hrefState.minPrice != null && (
                  <ActiveChip
                    label={`Min: ${hrefState.minPrice}`}
                    onClear={() => {
                      setMinPrice("");
                      navigate({ minPrice: undefined });
                    }}
                  />
                )}
                {hrefState.maxPrice != null && (
                  <ActiveChip
                    label={`Max: ${hrefState.maxPrice}`}
                    onClear={() => {
                      setMaxPrice("");
                      navigate({ maxPrice: undefined });
                    }}
                  />
                )}
                {hrefState.minStars != null && (
                  <ActiveChip
                    label={`${hrefState.minStars}★ o más`}
                    onClear={() => {
                      setMinStars("");
                      navigate({ minStars: undefined });
                    }}
                  />
                )}
                {hrefState.onSaleOnly && (
                  <ActiveChip
                    label="Ofertas"
                    onClear={() => {
                      setOnSaleOnly(false);
                      navigate({ onSaleOnly: undefined });
                    }}
                  />
                )}
                {hrefState.onlineOnly && (
                  <ActiveChip
                    label="Online"
                    onClear={() => {
                      setOnlineOnly(false);
                      navigate({ onlineOnly: undefined });
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Estado de carga */}
          {isPending && (
            <p className="text-[10px] text-brand font-bold animate-pulse text-center">
              Actualizando catálogo...
            </p>
          )}

          <button className="sr-only" type="submit">
            Buscar
          </button>
        </form>
      </section>

      {/* Info Contexto de País en Barra */}
      {activeCountryName ? (
        <div className="mt-3 rounded-2xl bg-blue-50/50 border border-blue-100 p-3 text-center text-xs text-slate-600">
          Mostrando productos de <strong className="text-slate-900">{activeCountryName}</strong>.{" "}
          <Link
            className="font-bold text-brand hover:underline"
            href={toMarketplaceHref({
              ...hrefState,
              countrySlug: undefined,
            })}
          >
            Ver todos los países
          </Link>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200/60 p-3 text-center text-xs text-slate-500">
          País: Elige uno en la barra superior para acotar tu región.
        </div>
      )}

    </div>
  );
}

function ActiveChip({
  label,
  onClear,
}: Readonly<{
  label: string;
  onClear: () => void;
}>) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 pl-2 pr-1 py-0.5 text-[10px] font-bold text-slate-700">
      {label}
      <button
        onClick={onClear}
        type="button"
        className="rounded-full hover:bg-slate-200 p-0.5 transition text-slate-400 hover:text-slate-900"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}
