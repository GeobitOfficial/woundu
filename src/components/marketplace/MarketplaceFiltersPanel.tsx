"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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
    const href = buildHref({ page: undefined, ...next });
    startTransition(() => {
      router.replace(href);
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

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

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
    <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      <FiltersHeader
        activeCountryName={activeCountryName}
        hrefState={hrefState}
      />

      <div className="space-y-5 p-4 sm:p-5">
        <form
          className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#fff_0%,#f8fafc_65%,#eef2ff_100%)] p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">Buscar</span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Escribe y presiona Enter..."
                type="text"
                value={search}
              />
              {search ? (
                <button
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => {
                    setSearch("");
                    if (hrefState.search) {
                      navigate({ search: undefined });
                    }
                  }}
                  type="button"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              ) : null}
            </label>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[30rem]">
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Ordenar
                </span>
                <select
                  className="h-12 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
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
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Desde
                </span>
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="0"
                  step="0.01"
                  type="number"
                  value={minPrice}
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Hasta
                </span>
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Sin tope"
                  step="0.01"
                  type="number"
                  value={maxPrice}
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ToggleChip
              active={onSaleOnly}
              icon={<Sparkles aria-hidden className="h-3.5 w-3.5" />}
              label="Solo ofertas"
              onClick={() => {
                const nextValue = !onSaleOnly;

                setOnSaleOnly(nextValue);
                navigate({ onSaleOnly: nextValue ? true : undefined });
              }}
            />
            <ToggleChip
              active={onlineOnly}
              icon={<SlidersHorizontal aria-hidden className="h-3.5 w-3.5" />}
              label="Solo pago online"
              onClick={() => {
                const nextValue = !onlineOnly;

                setOnlineOnly(nextValue);
                navigate({ onlineOnly: nextValue ? true : undefined });
              }}
            />
            {([5, 4, 3, 2, 1] as const).map((stars) => (
              <ToggleChip
                active={minStars === String(stars)}
                key={stars}
                label={`${stars}+ estrellas`}
                onClick={() => {
                  const nextValue = minStars === String(stars) ? "" : String(stars);

                  setMinStars(nextValue);
                  navigate({ minStars: nextValue ? Number(nextValue) : undefined });
                }}
              />
            ))}
          </div>

          {hasAdvanced || hrefState.search?.trim() ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-4">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Filtros activos
              </span>
              {hrefState.search?.trim() ? (
                <ActiveChip
                  label={`Buscar: ${hrefState.search.trim()}`}
                  onClear={() => {
                    setSearch("");
                    navigate({ search: undefined });
                  }}
                />
              ) : null}
              {hrefState.minPrice != null ? (
                <ActiveChip
                  label={`Desde ${hrefState.minPrice}`}
                  onClear={() => {
                    setMinPrice("");
                    navigate({ minPrice: undefined });
                  }}
                />
              ) : null}
              {hrefState.maxPrice != null ? (
                <ActiveChip
                  label={`Hasta ${hrefState.maxPrice}`}
                  onClear={() => {
                    setMaxPrice("");
                    navigate({ maxPrice: undefined });
                  }}
                />
              ) : null}
              {hrefState.minStars != null ? (
                <ActiveChip
                  label={`${hrefState.minStars}+ estrellas`}
                  onClear={() => {
                    setMinStars("");
                    navigate({ minStars: undefined });
                  }}
                />
              ) : null}
              {hrefState.onSaleOnly ? (
                <ActiveChip
                  label="Solo ofertas"
                  onClear={() => {
                    setOnSaleOnly(false);
                    navigate({ onSaleOnly: undefined });
                  }}
                />
              ) : null}
              {hrefState.onlineOnly ? (
                <ActiveChip
                  label="Solo pago online"
                  onClear={() => {
                    setOnlineOnly(false);
                    navigate({ onlineOnly: undefined });
                  }}
                />
              ) : null}
              {hrefState.sortBy && hrefState.sortBy !== "recent" ? (
                <ActiveChip
                  label={
                    hrefState.sortBy === "price_asc"
                      ? "Menor precio"
                      : hrefState.sortBy === "price_desc"
                        ? "Mayor precio"
                        : "Mejor calificados"
                  }
                  onClear={() => {
                    setSortBy("recent");
                    navigate({ sortBy: undefined });
                  }}
                />
              ) : null}

              <button
                className={cn(buttonVariants({ variant: "secondary" }), "h-9 rounded-full px-4 text-sm")}
                onClick={resetAdvancedFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{isPending ? "Actualizando resultados..." : "La búsqueda se aplica al presionar Enter."}</span>
            {hasAdvanced ? (
              <Link
                className="font-semibold text-slate-600 underline-offset-2 hover:text-slate-950 hover:underline"
                href={clearAdvancedHref}
              >
                Volver a filtros básicos
              </Link>
            ) : null}
          </div>

          <button className="sr-only" type="submit">
            Buscar
          </button>
        </form>
      </div>
    </section>
  );
}

function ToggleChip({
  active,
  icon,
  label,
  onClick,
}: Readonly<{
  active: boolean;
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
        active
          ? "border-brand bg-brand text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
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
    <button
      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
      onClick={onClear}
      type="button"
    >
      <span>{label}</span>
      <X aria-hidden className="h-3.5 w-3.5" />
    </button>
  );
}

function FiltersHeader({
  activeCountryName,
  hrefState,
}: Readonly<{
  hrefState: MarketplaceHrefValues;
  activeCountryName?: string;
}>) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Filtros
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Búsqueda, precio, calificación por estrellas y ofertas. Se combinan con
          la categoría elegida arriba y el país en la barra superior.
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
            className="font-semibold text-brand underline-offset-2 hover:underline"
            href={toMarketplaceHref({
              categorySlug: hrefState.categorySlug,
              search: hrefState.search,
              countrySlug: undefined,
              minPrice: hrefState.minPrice,
              maxPrice: hrefState.maxPrice,
              minStars: hrefState.minStars,
              onSaleOnly: hrefState.onSaleOnly,
              onlineOnly: hrefState.onlineOnly,
              sortBy: hrefState.sortBy,
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
  );
}

