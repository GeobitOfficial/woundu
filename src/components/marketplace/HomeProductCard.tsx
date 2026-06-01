import Link from "next/link";
import { MapPin, Star, Truck } from "lucide-react";

import type { ProductCardItem } from "@/features/products";
import { cn } from "@/lib/utils";
import {
  formatProductPrice,
  getConditionLabel,
  getProductDiscountPercent,
  getProductMarketplaceHref,
} from "@/utils/productDisplay";

import { ProductThumbnail } from "./ProductThumbnail";

type HomeProductCardProps = Readonly<{
  product: ProductCardItem;
  layout?: "carousel" | "compact";
}>;

export function HomeProductCard({
  layout = "carousel",
  product,
}: HomeProductCardProps) {
  const href = getProductMarketplaceHref(product);
  const discount = getProductDiscountPercent(product);
  const hasReviews = product.reviewCount > 0;
  const isCompact = layout === "compact";

  return (
    <Link
      className={cn(
        "group flex h-full flex-col bg-white transition hover:bg-slate-50",
        isCompact
          ? "overflow-hidden rounded-sm border border-slate-200 hover:shadow-md"
          : "min-w-[11.5rem] max-w-[11.5rem] shrink-0 border-r border-slate-100 sm:min-w-[13rem] sm:max-w-[13rem]",
      )}
      href={href}
    >
      <div className="flex min-h-9 items-center gap-1.5 px-3 pt-3 text-xs font-medium text-slate-600">
        {product.country ? (
          <>
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-brand" />
            <span className="line-clamp-1">Desde {product.country}</span>
          </>
        ) : (
          <span className="line-clamp-1 text-slate-500">
            {product.category?.name ?? "Producto"}
          </span>
        )}
      </div>

      <ProductThumbnail
        className={cn(isCompact ? "aspect-square p-3" : "aspect-square p-3")}
        product={product}
      />

      <div className={cn("flex flex-1 flex-col", isCompact ? "p-3 pt-0" : "px-4 pb-4")}>
        <h3
          className={cn(
            "line-clamp-2 text-slate-800 group-hover:text-brand",
            isCompact ? "min-h-[2.5rem] text-sm leading-5" : "min-h-[2.75rem] text-sm leading-snug",
          )}
        >
          {product.title}
        </h3>

        {product.isOnOffer && product.compareAtPrice != null ? (
          <p className="mt-2 text-xs text-slate-400 line-through">
            {formatProductPrice(product.compareAtPrice, product.currency)}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-xl font-normal text-slate-950">
            {formatProductPrice(product.price, product.currency)}
          </p>
          {discount != null ? (
            <span className="text-sm font-semibold text-brand">
              {discount}% OFF
            </span>
          ) : null}
        </div>

        {hasReviews ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-600">
            <Star
              aria-hidden="true"
              className="h-3.5 w-3.5 fill-brand text-brand"
            />
            {product.ratingAverage.toFixed(1)} ({product.reviewCount})
          </p>
        ) : null}

        <div className="mt-auto space-y-1 pt-2">
          {product.isOnOffer ? (
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
              <Truck aria-hidden="true" className="h-3.5 w-3.5" />
              Oferta activa
            </p>
          ) : null}
          <p className="text-[11px] text-slate-500">
            {getConditionLabel(product.condition)}
          </p>
        </div>
      </div>
    </Link>
  );
}
