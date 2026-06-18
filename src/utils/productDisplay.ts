import type { ProductCardItem } from "@/features/products";
import { PRODUCT_IMAGES_BUCKET } from "@/constants/storage";

import { formatMoney } from "@/lib/currency/formatMoney";

export function formatProductPrice(price: number, currency: string): string {
  return formatMoney(price, currency);
}

export function getProductDiscountPercent(
  product: ProductCardItem,
): number | null {
  if (
    !product.isOnOffer ||
    product.compareAtPrice == null ||
    product.compareAtPrice <= product.price
  ) {
    return null;
  }

  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}

export function getProductMarketplaceHref(product: ProductCardItem): string {
  return `/marketplace/${encodeURIComponent(product.slug)}`;
}

export function getProductStockLabel(stock: number): string {
  if (stock <= 0) {
    return "Agotado";
  }

  if (stock === 1) {
    return "Queda 1 unidad";
  }

  return `Quedan ${stock} unidades`;
}

export function isProductInStock(stock: number): boolean {
  return stock > 0;
}

export function getProductImageUrl(
  storagePath: string | null | undefined,
): string | null {
  if (!storagePath?.trim()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${encodedPath}`;
}

export type ProductImageRecord = Readonly<{
  storage_path: string;
  sort_order: number;
  is_primary: boolean;
}>;

export function pickPrimaryImagePath(
  images: ReadonlyArray<ProductImageRecord> | null | undefined,
): string | null {
  if (!images?.length) {
    return null;
  }

  const sorted = [...images].sort((first, second) => {
    if (first.is_primary && !second.is_primary) {
      return -1;
    }

    if (!first.is_primary && second.is_primary) {
      return 1;
    }

    return first.sort_order - second.sort_order;
  });

  return sorted[0]?.storage_path ?? null;
}

export function getConditionLabel(
  condition: ProductCardItem["condition"],
): string {
  switch (condition) {
    case "new":
      return "Nuevo";
    case "like_new":
      return "Como nuevo";
    case "used":
      return "Usado";
    case "refurbished":
      return "Reacondicionado";
    default:
      return condition;
  }
}
