import { LATIN_AMERICA_COUNTRIES } from "@/constants/latinAmericaCountries";

/** Países disponibles al publicar o editar un producto (incluye mercados extra). */
export const MARKETPLACE_COUNTRIES = [
  ...LATIN_AMERICA_COUNTRIES,
  "Estados Unidos",
] as const;

export type MarketplaceCountry = (typeof MARKETPLACE_COUNTRIES)[number];

export function isMarketplaceCountry(value: string): value is MarketplaceCountry {
  return (MARKETPLACE_COUNTRIES as readonly string[]).includes(value);
}
