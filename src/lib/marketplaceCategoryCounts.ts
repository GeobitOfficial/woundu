import type { ProductCardItem } from "@/features/products";

export function buildProductCountByCategoryId(
  products: ReadonlyArray<ProductCardItem>,
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();

  for (const product of products) {
    const categoryId = product.categoryId ?? product.category?.id;
    if (!categoryId) {
      continue;
    }
    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
  }

  return counts;
}
