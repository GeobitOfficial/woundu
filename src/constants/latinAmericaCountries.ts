/**
 * Países soberanos de Latinoamérica y el Caribe (nombres en español).
 * Usado en UI y como referencia de cobertura territorial del marketplace.
 */
export const LATIN_AMERICA_COUNTRIES = [
  "Antigua y Barbuda",
  "Argentina",
  "Bahamas",
  "Barbados",
  "Belice",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Dominica",
  "Ecuador",
  "El Salvador",
  "Granada",
  "Guatemala",
  "Guyana",
  "Haití",
  "Honduras",
  "Jamaica",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "República Dominicana",
  "San Cristóbal y Nieves",
  "San Vicente y las Granadinas",
  "Santa Lucía",
  "Surinam",
  "Trinidad y Tobago",
  "Uruguay",
  "Venezuela",
] as const;

export type LatinAmericaCountry = (typeof LATIN_AMERICA_COUNTRIES)[number];

function stripCombiningMarks(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Slug estable para URLs (`?pais=...`), sin acentos ni espacios.
 */
export function latinAmericaCountryToSlug(name: LatinAmericaCountry): string {
  return stripCombiningMarks(name.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resuelve el valor de `pais` en la URL al nombre canónico del catálogo.
 */
export function latinAmericaCountryFromSlug(
  slug: string,
): LatinAmericaCountry | null {
  const needle = slug.trim().toLowerCase();
  if (!needle) {
    return null;
  }

  for (const name of LATIN_AMERICA_COUNTRIES) {
    if (latinAmericaCountryToSlug(name) === needle) {
      return name;
    }
  }

  return null;
}
