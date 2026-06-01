import {
  LATIN_AMERICA_COUNTRIES,
  type LatinAmericaCountry,
} from "@/constants/latinAmericaCountries";

export type CountryRegionId = "caribbean" | "central_america" | "south_america";

export const COUNTRY_REGION_LABELS: Record<CountryRegionId, string> = {
  caribbean: "Caribe",
  central_america: "Centroamérica y México",
  south_america: "Sudamérica",
};

export const COUNTRY_REGION_ORDER: CountryRegionId[] = [
  "south_america",
  "central_america",
  "caribbean",
];

type CountryMeta = Readonly<{
  isoCode: string;
  region: CountryRegionId;
}>;

const LATIN_AMERICA_COUNTRY_META: Record<LatinAmericaCountry, CountryMeta> = {
  "Antigua y Barbuda": { isoCode: "AG", region: "caribbean" },
  Argentina: { isoCode: "AR", region: "south_america" },
  Bahamas: { isoCode: "BS", region: "caribbean" },
  Barbados: { isoCode: "BB", region: "caribbean" },
  Belice: { isoCode: "BZ", region: "central_america" },
  Bolivia: { isoCode: "BO", region: "south_america" },
  Brasil: { isoCode: "BR", region: "south_america" },
  Chile: { isoCode: "CL", region: "south_america" },
  Colombia: { isoCode: "CO", region: "south_america" },
  "Costa Rica": { isoCode: "CR", region: "central_america" },
  Cuba: { isoCode: "CU", region: "caribbean" },
  Dominica: { isoCode: "DM", region: "caribbean" },
  Ecuador: { isoCode: "EC", region: "south_america" },
  "El Salvador": { isoCode: "SV", region: "central_america" },
  Granada: { isoCode: "GD", region: "caribbean" },
  Guatemala: { isoCode: "GT", region: "central_america" },
  Guyana: { isoCode: "GY", region: "south_america" },
  Haití: { isoCode: "HT", region: "caribbean" },
  Honduras: { isoCode: "HN", region: "central_america" },
  Jamaica: { isoCode: "JM", region: "caribbean" },
  México: { isoCode: "MX", region: "central_america" },
  Nicaragua: { isoCode: "NI", region: "central_america" },
  Panamá: { isoCode: "PA", region: "central_america" },
  Paraguay: { isoCode: "PY", region: "south_america" },
  Perú: { isoCode: "PE", region: "south_america" },
  "República Dominicana": { isoCode: "DO", region: "caribbean" },
  "San Cristóbal y Nieves": { isoCode: "KN", region: "caribbean" },
  "San Vicente y las Granadinas": { isoCode: "VC", region: "caribbean" },
  "Santa Lucía": { isoCode: "LC", region: "caribbean" },
  Surinam: { isoCode: "SR", region: "south_america" },
  "Trinidad y Tobago": { isoCode: "TT", region: "caribbean" },
  Uruguay: { isoCode: "UY", region: "south_america" },
  Venezuela: { isoCode: "VE", region: "south_america" },
};

export function getCountryMeta(country: LatinAmericaCountry): CountryMeta {
  return LATIN_AMERICA_COUNTRY_META[country];
}

export function countryCodeToFlagEmoji(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

export function isLatinAmericaCountry(value: string): value is LatinAmericaCountry {
  return (LATIN_AMERICA_COUNTRIES as readonly string[]).includes(value);
}
