/**
 * Estado de filtros del marketplace reflejado en la URL (`/marketplace?...`).
 */
export type MarketplaceHrefValues = Readonly<{
  categorySlug?: string;
  search?: string;
  countrySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minStars?: number;
  onSaleOnly?: boolean;
}>;

export function toMarketplaceHref(values: MarketplaceHrefValues): string {
  const params = new URLSearchParams();

  if (values.categorySlug?.trim()) {
    params.set("categoria", values.categorySlug.trim());
  }

  if (values.search?.trim()) {
    params.set("q", values.search.trim());
  }

  if (values.countrySlug?.trim()) {
    params.set("pais", values.countrySlug.trim());
  }

  if (values.minPrice != null && Number.isFinite(values.minPrice)) {
    params.set("min_precio", String(values.minPrice));
  }

  if (values.maxPrice != null && Number.isFinite(values.maxPrice)) {
    params.set("max_precio", String(values.maxPrice));
  }

  if (
    values.minStars != null &&
    Number.isInteger(values.minStars) &&
    values.minStars >= 1 &&
    values.minStars <= 5
  ) {
    params.set("min_estrellas", String(values.minStars));
  }

  if (values.onSaleOnly) {
    params.set("solo_ofertas", "1");
  }

  const query = params.toString();
  return query ? `/marketplace?${query}` : "/marketplace";
}

export function parsePriceQueryParam(raw: string | undefined): number | undefined {
  if (raw == null || raw.trim() === "") {
    return undefined;
  }

  const normalized = raw.trim().replace(",", ".");
  const value = Number(normalized);

  if (!Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return Math.round(value * 100) / 100;
}

export function parseMinStarsQueryParam(raw: string | undefined): number | undefined {
  if (raw == null || raw.trim() === "") {
    return undefined;
  }

  const value = Number.parseInt(raw, 10);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return undefined;
  }

  return value;
}

export function parseOnSaleQueryParam(raw: string | undefined): boolean {
  return raw === "1" || raw === "true";
}

export function normalizePriceRange(
  min?: number,
  max?: number,
): Readonly<{ min?: number; max?: number }> {
  if (min == null && max == null) {
    return {};
  }

  if (min != null && max != null && min > max) {
    return { min: max, max: min };
  }

  return { min, max };
}
