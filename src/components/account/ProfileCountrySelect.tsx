"use client";

import { useMemo } from "react";

import { LATIN_AMERICA_COUNTRIES } from "@/constants/latinAmericaCountries";
import {
  formatCurrencyLabel,
  getCurrencyForCountryName,
} from "@/constants/countryCurrencies";

type ProfileCountrySelectProps = Readonly<{
  error?: string;
  onChange: (country: string) => void;
  value: string;
}>;

export function ProfileCountrySelect({
  error,
  onChange,
  value,
}: ProfileCountrySelectProps) {
  const currencyPreview = useMemo(() => {
    const currency = getCurrencyForCountryName(value);
    return currency ? formatCurrencyLabel(currency) : null;
  }, [value]);

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-800">Pais de tu cuenta</span>
      <select
        aria-invalid={Boolean(error)}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Selecciona tu pais</option>
        {LATIN_AMERICA_COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs leading-5 text-red-600">{error}</p>
      ) : currencyPreview ? (
        <p className="text-xs leading-5 text-slate-500">
          Moneda de tu cuenta:{" "}
          <span className="font-semibold text-slate-700">{currencyPreview}</span>.
          Tus ganancias se mostraran en esta divisa. Los productos ya publicados
          conservan su pais y moneda originales hasta que los edites.
        </p>
      ) : (
        <p className="text-xs leading-5 text-slate-500">
          Define el pais y la moneda predeterminada de tu cuenta de vendedor.
        </p>
      )}
    </label>
  );
}
