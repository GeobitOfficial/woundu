import {
  LATIN_AMERICA_COUNTRIES,
  type LatinAmericaCountry,
} from "@/constants/latinAmericaCountries";
import {
  MARKETPLACE_COUNTRIES,
  type MarketplaceCountry,
} from "@/constants/marketplaceCountries";

export const COUNTRY_CURRENCY_MAP: Record<LatinAmericaCountry, string> = {
  "Antigua y Barbuda": "XCD",
  Argentina: "ARS",
  Bahamas: "BSD",
  Barbados: "BBD",
  Belice: "BZD",
  Bolivia: "BOB",
  Brasil: "BRL",
  Chile: "CLP",
  Colombia: "COP",
  "Costa Rica": "CRC",
  Cuba: "CUP",
  Dominica: "XCD",
  Ecuador: "USD",
  "El Salvador": "USD",
  Granada: "XCD",
  Guatemala: "GTQ",
  Guyana: "GYD",
  Haití: "HTG",
  Honduras: "HNL",
  Jamaica: "JMD",
  México: "MXN",
  Nicaragua: "NIO",
  Panamá: "USD",
  Paraguay: "PYG",
  Perú: "PEN",
  "República Dominicana": "DOP",
  "San Cristóbal y Nieves": "XCD",
  "San Vicente y las Granadinas": "XCD",
  "Santa Lucía": "XCD",
  Surinam: "SRD",
  "Trinidad y Tobago": "TTD",
  Uruguay: "UYU",
  Venezuela: "VES",
};

const EXTENDED_COUNTRY_CURRENCY: Readonly<Record<string, string>> = {
  ...COUNTRY_CURRENCY_MAP,
  "Estados Unidos": "USD",
};

export const MARKETPLACE_COUNTRY_CURRENCY_MAP: Record<MarketplaceCountry, string> =
  EXTENDED_COUNTRY_CURRENCY as Record<MarketplaceCountry, string>;

export { MARKETPLACE_COUNTRIES };

const CURRENCY_LABELS: Readonly<Record<string, string>> = {
  ARS: "Peso argentino",
  BOB: "Boliviano",
  BRL: "Real brasileño",
  BSD: "Dólar bahamense",
  BBD: "Dólar de Barbados",
  BZD: "Dólar beliceño",
  CLP: "Peso chileno",
  COP: "Peso colombiano",
  CRC: "Colón costarricense",
  CUP: "Peso cubano",
  DOP: "Peso dominicano",
  GTQ: "Quetzal guatemalteco",
  GYD: "Dólar guyanés",
  HTG: "Gourde haitiano",
  HNL: "Lempira hondureño",
  JMD: "Dólar jamaicano",
  MXN: "Peso mexicano",
  NIO: "Córdoba nicaragüense",
  PEN: "Sol peruano",
  PYG: "Guaraní paraguayo",
  SRD: "Dólar surinamés",
  TTD: "Dólar trinitense",
  USD: "Dólar estadounidense",
  UYU: "Peso uruguayo",
  VES: "Bolívar venezolano",
  XCD: "Dólar del Caribe Oriental",
};

export function isLatinAmericaCountry(value: string): value is LatinAmericaCountry {
  return (LATIN_AMERICA_COUNTRIES as readonly string[]).includes(value);
}

export function getCurrencyForCountry(country: LatinAmericaCountry): string {
  return COUNTRY_CURRENCY_MAP[country];
}

export function getCurrencyForCountryName(country: string): string | null {
  if (isLatinAmericaCountry(country)) {
    return getCurrencyForCountry(country);
  }

  return EXTENDED_COUNTRY_CURRENCY[country] ?? null;
}

export function isSupportedCountryCurrency(country: string): boolean {
  return getCurrencyForCountryName(country) != null;
}

export function getCurrencyDisplayName(currencyCode: string): string {
  return CURRENCY_LABELS[currencyCode] ?? currencyCode;
}

export function formatCurrencyLabel(currencyCode: string): string {
  const name = getCurrencyDisplayName(currencyCode);
  return name === currencyCode ? currencyCode : `${name} (${currencyCode})`;
}
