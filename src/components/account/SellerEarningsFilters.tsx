"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  buildSellerEarningsHref,
  toMonthInputValue,
  type SellerEarningsFilter,
  type SellerEarningsPeriodKind,
} from "@/lib/account/sellerEarningsPeriod";
import { cn } from "@/lib/utils";

type SellerEarningsFiltersProps = Readonly<{
  filter: SellerEarningsFilter;
  maxYear: number;
}>;

const PERIOD_OPTIONS: ReadonlyArray<{
  value: SellerEarningsPeriodKind;
  label: string;
}> = [
  { value: "month", label: "Mensual" },
  { value: "semester", label: "Semestral" },
  { value: "year", label: "Anual" },
];

export function SellerEarningsFilters({
  filter,
  maxYear,
}: SellerEarningsFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function applyFilter(next: SellerEarningsFilter) {
    startTransition(() => {
      router.push(buildSellerEarningsHref(next));
    });
  }

  return (
    <section className="rounded-[2rem] border border-brand/25 bg-white/95 p-5 shadow-lg shadow-brand/10 backdrop-blur-sm sm:p-6">
      <h2 className="text-base font-black text-slate-950">Periodo de consulta</h2>
      <p className="mt-1 text-sm text-slate-600">
        Elige cómo quieres ver tus ganancias. En vista mensual puedes seleccionar
        cualquier mes.
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Tipo de periodo">
        {PERIOD_OPTIONS.map((option) => (
          <button
            aria-selected={filter.kind === option.value}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition",
              filter.kind === option.value
                ? "bg-brand text-white shadow-md shadow-brand/25"
                : "bg-slate-100 text-slate-700 hover:bg-brand-light/70 hover:text-brand-dark",
              isPending && "opacity-70",
            )}
            key={option.value}
            onClick={() =>
              applyFilter({
                ...filter,
                kind: option.value,
              })
            }
            role="tab"
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filter.kind === "month" ? (
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">Mes</span>
            <input
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
              disabled={isPending}
              max={toMonthInputValue(maxYear, 12)}
              min="2020-01"
              onChange={(event) => {
                const value = event.target.value;
                if (!/^\d{4}-\d{2}$/.test(value)) {
                  return;
                }
                const [yearPart, monthPart] = value.split("-");
                applyFilter({
                  ...filter,
                  kind: "month",
                  year: Number.parseInt(yearPart, 10),
                  month: Number.parseInt(monthPart, 10),
                  semester:
                    Number.parseInt(monthPart, 10) <= 6 ? 1 : 2,
                });
              }}
              type="month"
              value={toMonthInputValue(filter.year, filter.month)}
            />
          </label>
        ) : null}

        {filter.kind === "semester" ? (
          <>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-800">Año</span>
              <select
                aria-label="Año del semestre"
                className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                disabled={isPending}
                onChange={(event) =>
                  applyFilter({
                    ...filter,
                    year: Number.parseInt(event.target.value, 10),
                  })
                }
                value={filter.year}
              >
                {Array.from({ length: maxYear - 2019 }, (_, index) => {
                  const year = maxYear - index;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-800">Semestre</span>
              <select
                aria-label="Semestre del año"
                className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                disabled={isPending}
                onChange={(event) =>
                  applyFilter({
                    ...filter,
                    semester: Number.parseInt(event.target.value, 10) as 1 | 2,
                  })
                }
                value={filter.semester}
              >
                <option value={1}>1.er semestre (ene–jun)</option>
                <option value={2}>2.º semestre (jul–dic)</option>
              </select>
            </label>
          </>
        ) : null}

        {filter.kind === "year" ? (
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">Año</span>
            <select
              aria-label="Año de consulta"
              className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
              disabled={isPending}
              onChange={(event) =>
                applyFilter({
                  ...filter,
                  year: Number.parseInt(event.target.value, 10),
                })
              }
              value={filter.year}
            >
              {Array.from({ length: maxYear - 2019 }, (_, index) => {
                const year = maxYear - index;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </label>
        ) : null}
      </div>
    </section>
  );
}
