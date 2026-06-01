import type { Category } from "@/types";

import type { ProductCardItem } from "./types";

export type MarketplaceCategorySection = Readonly<{
  key: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  slug?: string;
  products: ProductCardItem[];
}>;

/**
 * Agrupa productos por categoría activa del catálogo, en el orden de `categories`.
 * Incluye bloques para categorías no listadas y sin categoría cuando aplique.
 */
export function buildMarketplaceCategorySections(
  categories: Category[],
  products: ProductCardItem[],
): MarketplaceCategorySection[] {
  const listedIds = new Set(categories.map((category) => category.id));
  const sections: MarketplaceCategorySection[] = [];

  for (const category of categories) {
    const inCategory = products.filter(
      (product) => product.category?.id === category.id,
    );
    if (inCategory.length > 0) {
      sections.push({
        key: category.slug,
        title: category.name,
        description: category.description,
        icon: category.icon,
        slug: category.slug,
        products: inCategory,
      });
    }
  }

  const otherListed = products.filter(
    (product) =>
      product.category !== null && !listedIds.has(product.category.id),
  );
  if (otherListed.length > 0) {
    sections.push({
      key: "otras-categorias",
      title: "Otras categorías",
      products: otherListed,
    });
  }

  const uncategorized = products.filter((product) => !product.category);
  if (uncategorized.length > 0) {
    sections.push({
      key: "sin-categoria",
      title: "Sin categoría",
      products: uncategorized,
    });
  }

  return sections;
}
