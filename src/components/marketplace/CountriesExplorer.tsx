"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronRight,
  Globe2,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  COUNTRY_REGION_LABELS,
  COUNTRY_REGION_ORDER,
  type CountryRegionId,
} from "@/constants/latinAmericaCountryMeta";
import {
  formatCountryProductCount,
  type CountryCoverageItem,
} from "@/lib/marketplaceCountryCoverage";
import { cn } from "@/lib/utils";

type CountriesExplorerProps = Readonly<{
  countries: CountryCoverageItem[];
}>;

type RegionFilter = "all" | CountryRegionId;
type SortMode = "name" | "products_desc" | "products_asc";

const SORT_OPTIONS: ReadonlyArray<{ value: SortMode; label: string }> = [
  { value: "name", label: "A–Z" },
  { value: "products_desc", label: "Más productos" },
  { value: "products_asc", label: "Menos productos" },
];

export function CountriesExplorer({ countries }: CountriesExplorerProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [sort, setSort] = useState<SortMode>("name");

  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const next = countries.filter((country) => {
      const matchesRegion = region === "all" || country.region === region;
      const matchesQuery =
        !normalizedQuery ||
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.regionLabel.toLowerCase().includes(normalizedQuery);

      return matchesRegion && matchesQuery;
    });

    next.sort((left, right) => {
      switch (sort) {
        case "products_desc":
          if (right.productCount !== left.productCount) {
            return right.productCount - left.productCount;
          }
          return left.name.localeCompare(right.name, "es");
        case "products_asc":
          if (left.productCount !== right.productCount) {
            return left.productCount - right.productCount;
          }
          return left.name.localeCompare(right.name, "es");
        default:
          return left.name.localeCompare(right.name, "es");
      }
    });

    return next;
  }, [countries, query, region, sort]);

  const regionCounts = useMemo(() => {
    const counts: Record<CountryRegionId, number> = {
      caribbean: 0,
      central_america: 0,
      south_america: 0,
    };

    for (const country of countries) {
      counts[country.region] += 1;
    }

    return counts;
  }, [countries]);

  return (
    <section className="py-10" id="explorar-paises">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                  Explorar por país
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Filtra por región, busca tu mercado y entra al catálogo con el
                  país ya aplicado.
                </p>
              </div>

              <p className="text-sm font-medium text-slate-500">
                {filteredCountries.length} de {countries.length} países
              </p>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
              <label className="relative block">
                <span className="sr-only">Buscar país</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar país o región..."
                  type="search"
                  value={query}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5" />
                  Ordenar
                </span>
                <select
                  aria-label="Ordenar países"
                  className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-brand focus:ring-4 focus:ring-brand/15"
                  onChange={(event) => setSort(event.target.value as SortMode)}
                  value={sort}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div
              className="mt-4 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filtrar por región"
            >
              <RegionChip
                count={countries.length}
                isActive={region === "all"}
                label="Todos"
                onClick={() => setRegion("all")}
              />
              {COUNTRY_REGION_ORDER.map((regionId) => (
                <RegionChip
                  count={regionCounts[regionId]}
                  isActive={region === regionId}
                  key={regionId}
                  label={COUNTRY_REGION_LABELS[regionId]}
                  onClick={() => setRegion(regionId)}
                />
              ))}
            </div>
          </div>

          {filteredCountries.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <SlidersHorizontal aria-hidden="true" className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-800">
                No encontramos países con ese criterio
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Prueba otra búsqueda o selecciona otra región para ver más
                mercados disponibles.
              </p>
              <button
                className="mt-6 text-sm font-bold text-brand underline-offset-2 hover:underline"
                onClick={() => {
                  setQuery("");
                  setRegion("all");
                }}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCountries.map((country) => (
                <CountryCoverageCard country={country} key={country.name} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RegionChip({
  count,
  isActive,
  label,
  onClick,
}: Readonly<{
  count: number;
  isActive: boolean;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      aria-pressed={isActive}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
        isActive
          ? "border-brand bg-brand text-white shadow-sm shadow-brand/20"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-bold",
          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function CountryCoverageCard({
  country,
}: Readonly<{ country: CountryCoverageItem }>) {
  const hasProducts = country.productCount > 0;

  return (
    <Link
      className="group flex h-full flex-col bg-white p-5 transition hover:bg-brand-light"
      href={`/marketplace?pais=${country.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="text-3xl leading-none drop-shadow-sm"
        >
          {country.flagEmoji}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
            hasProducts
              ? "bg-brand-muted text-brand-dark"
              : "bg-slate-100 text-slate-500",
          )}
        >
          {hasProducts ? "Activo" : "Disponible"}
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold leading-snug text-slate-950">
        {country.name}
      </h3>

      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Globe2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
        {country.regionLabel}
      </p>

      <p className="mt-3 text-sm text-slate-600">
        {formatCountryProductCount(country.productCount)}
      </p>

      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand group-hover:underline">
        Ver catálogo
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </span>
    </Link>
  );
}
