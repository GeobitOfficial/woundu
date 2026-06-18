import type { SellerProductListItem } from "./services/sellerProductService";

export type SellerProductSection = Readonly<{
  key: string;
  title: string;
  icon: string | null;
  products: ReadonlyArray<SellerProductListItem>;
}>;

export function buildSellerProductSections(
  products: ReadonlyArray<SellerProductListItem>,
): ReadonlyArray<SellerProductSection> {
  const grouped = new Map<
    string,
    { title: string; icon: string | null; products: SellerProductListItem[] }
  >();
  const uncategorized: SellerProductListItem[] = [];

  for (const product of products) {
    if (product.categoryId && product.categoryName) {
      const current = grouped.get(product.categoryId) ?? {
        title: product.categoryName,
        icon: product.categoryIcon,
        products: [],
      };
      current.products.push(product);
      grouped.set(product.categoryId, current);
      continue;
    }

    uncategorized.push(product);
  }

  const sections: SellerProductSection[] = [...grouped.values()]
    .map((entry) => ({
      key: entry.products[0]?.categorySlug ?? entry.title,
      title: entry.title,
      icon: entry.icon,
      products: entry.products,
    }))
    .sort((first, second) => first.title.localeCompare(second.title, "es"));

  if (uncategorized.length > 0) {
    sections.push({
      key: "sin-categoria",
      title: "Sin categoria",
      icon: null,
      products: uncategorized,
    });
  }

  return sections;
}
