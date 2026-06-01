import type { Category } from "@/types";

import type { ProductCardItem } from "./types";

export type LandingCategoryShowcase = Readonly<{
  category: Category;
  products: ReadonlyArray<ProductCardItem>;
}>;

export function buildLandingCategoryShowcases(
  categories: ReadonlyArray<Category>,
  products: ReadonlyArray<ProductCardItem>,
  maxCategories = 8,
  productsPerCategory = 8,
): LandingCategoryShowcase[] {
  const showcases: LandingCategoryShowcase[] = [];

  for (const category of categories) {
    const categoryProducts = products
      .filter((product) => product.categoryId === category.id)
      .slice(0, productsPerCategory);

    if (categoryProducts.length === 0) {
      continue;
    }

    showcases.push({ category, products: categoryProducts });

    if (showcases.length >= maxCategories) {
      break;
    }
  }

  return showcases;
}
