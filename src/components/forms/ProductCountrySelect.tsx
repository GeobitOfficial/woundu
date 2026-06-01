"use client";

import { useMemo } from "react";

import { MARKETPLACE_COUNTRIES } from "@/constants/marketplaceCountries";
import {
  formatCurrencyLabel,
  getCurrencyForCountryName,
} from "@/constants/countryCurrencies";

type ProductCountrySelectProps = Readonly<{
  defaultCountry?: string;
  error?: string;
  helperText?: string;
  onCountryChange?: (country: string) => void;
  selectedCountry?: string;
}>;

export function ProductCountrySelect({
  defaultCountry = "",
  error,
  helperText,
  onCountryChange,
  selectedCountry,
}: ProductCountrySelectProps) {
  const isControlled = selectedCountry != null;
  const currencyPreview = useMemo(() => {
    const country = isControlled ? selectedCountry : defaultCountry;
    const currency = country ? getCurrencyForCountryName(country) : null;
    return currency ? formatCurrencyLabel(currency) : null;
  }, [defaultCountry, isControlled, selectedCountry]);

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-800">
        Pais del producto
      </span>
      <select
        aria-invalid={Boolean(error)}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
        defaultValue={isControlled ? undefined : defaultCountry}
        name="country"
        onChange={
          onCountryChange
            ? (event) => onCountryChange(event.target.value)
            : undefined
        }
        value={isControlled ? selectedCountry : undefined}
      >
        <option value="">Selecciona un pais</option>
        {MARKETPLACE_COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs leading-5 text-red-600">{error}</p>
      ) : (
        <p className="text-xs leading-5 text-slate-500">
          {helperText ??
            (currencyPreview
              ? `Precio en ${currencyPreview}. El producto quedara disponible solo para este mercado.`
              : "El precio usara la moneda del pais seleccionado.")}
        </p>
      )}
    </label>
  );
}

export function useProductCountryCurrency(country: string): string {
  return useMemo(() => {
    return getCurrencyForCountryName(country) ?? "USD";
  }, [country]);
}
