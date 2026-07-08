import type { Category } from "@/types";

import {
  getHomeSectionReferenceImage,
  type HomeSectionReferenceImage,
} from "@/constants/homeSectionImages";

import type { ProductCardItem } from "./types";

export type HomeSectionTheme =
  | "spotlight-dark"
  | "deals-banner"
  | "split-showcase"
  | "floating-cards"
  | "editorial"
  | "bento-grid"
  | "marketplace-grid";

export type HomeProductSectionData = Readonly<{
  id: string;
  title: string;
  viewAllHref: string;
  viewAllLabel: string;
  products: ReadonlyArray<ProductCardItem>;
  theme: HomeSectionTheme;
  accentClass?: string;
  referenceImage: HomeSectionReferenceImage;
}>;

const SECTIONS_PER_SHELF = 12;

type LandingProductBuckets = Readonly<{
  catalogProducts: ReadonlyArray<ProductCardItem>;
  latestProducts: ReadonlyArray<ProductCardItem>;
  offerProducts: ReadonlyArray<ProductCardItem>;
  topRatedProducts: ReadonlyArray<ProductCardItem>;
  pool: ReadonlyArray<ProductCardItem>;
}>;

const HOME_SECTION_DEFINITIONS = [
  {
    id: "top-ventas",
    title: "Top ventas",
    viewAllHref: "/marketplace?min_estrellas=4",
    viewAllLabel: "Ver top ventas",
    theme: "spotlight-dark" as const,
    resolve: (buckets: LandingProductBuckets) =>
      pickSectionProducts(buckets.topRatedProducts),
  },
  {
    id: "ofertas",
    title: "Ofertas imperdibles",
    viewAllHref: "/marketplace?solo_ofertas=1",
    viewAllLabel: "Ver ofertas",
    theme: "deals-banner" as const,
    resolve: (buckets: LandingProductBuckets) =>
      pickSectionProducts(buckets.offerProducts),
  },
  {
    id: "hogar",
    title: "Para el hogar",
    viewAllHref: "/marketplace?categoria=hogar",
    viewAllLabel: "Ver hogar",
    theme: "split-showcase" as const,
    accentClass: "from-amber-50 via-orange-50 to-brand-light",
    resolve: (buckets: LandingProductBuckets, categories: ReadonlyArray<Category>) =>
      productsForCategory(buckets.pool, categories, "hogar"),
  },
  {
    id: "tecnologia",
    title: "Tecnología y gadgets",
    viewAllHref: "/marketplace?categoria=tecnologia",
    viewAllLabel: "Ver tecnología",
    theme: "floating-cards" as const,
    resolve: (buckets: LandingProductBuckets, categories: ReadonlyArray<Category>) =>
      productsForCategory(buckets.pool, categories, "tecnologia"),
  },
  {
    id: "moda",
    title: "Moda y accesorios",
    viewAllHref: "/marketplace?categoria=moda",
    viewAllLabel: "Ver moda",
    theme: "editorial" as const,
    resolve: (buckets: LandingProductBuckets, categories: ReadonlyArray<Category>) =>
      productsForCategory(buckets.pool, categories, "moda"),
  },
  {
    id: "recomendados",
    title: "Recomendados para ti",
    viewAllHref: "/marketplace",
    viewAllLabel: "Ver todo",
    theme: "marketplace-grid" as const,
    resolve: (buckets: LandingProductBuckets) =>
      pickSectionProducts(buckets.catalogProducts),
  },
] as const;

export function buildHomeProductSections(
  categories: ReadonlyArray<Category>,
  buckets: LandingProductBuckets,
): HomeProductSectionData[] {
  return HOME_SECTION_DEFINITIONS.map((definition) => {
    const products = definition
      .resolve(buckets, categories)
      .slice(0, SECTIONS_PER_SHELF);

    return {
      id: definition.id,
      title: definition.title,
      viewAllHref: definition.viewAllHref,
      viewAllLabel: definition.viewAllLabel,
      products,
      theme: definition.theme,
      accentClass: "accentClass" in definition ? definition.accentClass : undefined,
      referenceImage: getHomeSectionReferenceImage(definition.id),
    };
  });
}

function pickSectionProducts(
  primary: ReadonlyArray<ProductCardItem>,
): ProductCardItem[] {
  return [...primary];
}

function productsForCategory(
  pool: ReadonlyArray<ProductCardItem>,
  categories: ReadonlyArray<Category>,
  categorySlug: string,
): ProductCardItem[] {
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) {
    return [];
  }

  return pool.filter((product) => product.categoryId === category.id);
}
