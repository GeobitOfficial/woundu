import {
  COUNTRY_REGION_LABELS,
  countryCodeToFlagEmoji,
  getCountryMeta,
  type CountryRegionId,
} from "@/constants/latinAmericaCountryMeta";
import {
  LATIN_AMERICA_COUNTRIES,
  latinAmericaCountryToSlug,
  type LatinAmericaCountry,
} from "@/constants/latinAmericaCountries";

export type CountryCoverageItem = Readonly<{
  name: LatinAmericaCountry;
  slug: string;
  region: CountryRegionId;
  regionLabel: string;
  flagEmoji: string;
  productCount: number;
}>;

export type CountryCoverageSummary = Readonly<{
  totalCountries: number;
  countriesWithListings: number;
  totalProducts: number;
  topCountries: CountryCoverageItem[];
}>;

export function buildCountryCoverageItems(
  countByCountry: ReadonlyMap<string, number>,
): CountryCoverageItem[] {
  return LATIN_AMERICA_COUNTRIES.map((name) => {
    const meta = getCountryMeta(name);

    return {
      name,
      slug: latinAmericaCountryToSlug(name),
      region: meta.region,
      regionLabel: COUNTRY_REGION_LABELS[meta.region],
      flagEmoji: countryCodeToFlagEmoji(meta.isoCode),
      productCount: countByCountry.get(name) ?? 0,
    };
  });
}

export function summarizeCountryCoverage(
  items: ReadonlyArray<CountryCoverageItem>,
): CountryCoverageSummary {
  const countriesWithListings = items.filter(
    (item) => item.productCount > 0,
  ).length;
  const totalProducts = items.reduce(
    (accumulator, item) => accumulator + item.productCount,
    0,
  );
  const topCountries = [...items]
    .sort((left, right) => {
      if (right.productCount !== left.productCount) {
        return right.productCount - left.productCount;
      }

      return left.name.localeCompare(right.name, "es");
    })
    .slice(0, 6);

  return {
    totalCountries: items.length,
    countriesWithListings,
    totalProducts,
    topCountries,
  };
}

export function formatCountryProductCount(count: number): string {
  if (count === 0) {
    return "Sin publicaciones aún";
  }

  return `${count} producto${count === 1 ? "" : "s"} activo${count === 1 ? "" : "s"}`;
}
