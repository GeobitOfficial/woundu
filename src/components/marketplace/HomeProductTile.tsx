import type { ProductCardItem } from "@/features/products";

import { HomeProductCard } from "./HomeProductCard";

type HomeProductTileProps = Readonly<{
  product: ProductCardItem;
}>;

/** @deprecated Usa `HomeProductCard` con layout compact o carousel. */
export function HomeProductTile({ product }: HomeProductTileProps) {
  return <HomeProductCard layout="compact" product={product} />;
}
