"use client";

import { type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  LATIN_AMERICA_COUNTRIES,
  latinAmericaCountryFromSlug,
  latinAmericaCountryToSlug,
} from "@/constants/latinAmericaCountries";
import { cn } from "@/lib/utils";

const SELECT_CLASSES =
  "h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5";

type CountryMarketplaceSelectProps = Readonly<{
  layout: "desktop" | "mobile";
}>;

export function CountryMarketplaceSelect({
  layout,
}: CountryMarketplaceSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("pais")?.trim() ?? "";
  const resolved = raw ? latinAmericaCountryFromSlug(raw) : null;
  const value = resolved ? latinAmericaCountryToSlug(resolved) : "";

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    const nextParams = new URLSearchParams(searchParams.toString());

    if (!next) {
      nextParams.delete("pais");
    } else {
      nextParams.set("pais", next);
    }

    const query = nextParams.toString();
    router.push(query ? `/marketplace?${query}` : "/marketplace");
  }

  return (
    <label
      className={cn(
        layout === "desktop" ? "hidden shrink-0 md:flex" : "flex md:hidden",
        layout === "mobile" ? "w-full flex-col gap-1.5" : "items-center gap-2",
      )}
    >
      <span
        className={cn(
          "whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500",
          layout === "desktop" && "sr-only",
        )}
      >
        Productos por país
      </span>
      <select
        aria-label="Ver productos ofrecidos en un país"
        className={cn(
          SELECT_CLASSES,
          layout === "desktop" ? "max-w-[11rem] truncate lg:max-w-[13rem]" : "w-full",
        )}
        onChange={handleChange}
        value={value}
      >
        <option value="">Todos los países</option>
        {LATIN_AMERICA_COUNTRIES.map((country) => (
          <option
            key={country}
            value={latinAmericaCountryToSlug(country)}
          >
            {country}
          </option>
        ))}
      </select>
    </label>
  );
}

type CountryMarketplaceSelectFallbackProps = Readonly<{
  layout: "desktop" | "mobile";
}>;

export function CountryMarketplaceSelectFallback({
  layout,
}: CountryMarketplaceSelectFallbackProps) {
  return (
    <div
      className={cn(
        layout === "desktop" ? "hidden shrink-0 md:block" : "block md:hidden",
        layout === "mobile" && "w-full",
      )}
    >
      <label className={cn(layout === "mobile" && "flex w-full flex-col gap-1.5")}>
        <span className="sr-only">Productos por país</span>
        <select
          aria-hidden="true"
          className={cn(
            SELECT_CLASSES,
            "cursor-not-allowed opacity-60",
            layout === "desktop" ? "max-w-[11rem] lg:max-w-[13rem]" : "w-full",
          )}
          disabled
          tabIndex={-1}
        >
          <option>País</option>
        </select>
      </label>
    </div>
  );
}
