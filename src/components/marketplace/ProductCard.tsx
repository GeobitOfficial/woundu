import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui";
import type { ProductCardItem } from "@/features/products";
import {
  formatProductPrice,
  getConditionLabel,
  getProductDiscountPercent,
} from "@/utils/productDisplay";

import { ProductCardMarketActions } from "./ProductCardMarketActions";
import { ProductRatingStars } from "./ProductRatingStars";
import { ProductThumbnail } from "./ProductThumbnail";

type ProductCardProps = Readonly<{
  product: ProductCardItem;
  viewerId: string | null;
  initialFavorited: boolean;
}>;

export function ProductCard({
  initialFavorited,
  product,
  viewerId,
}: ProductCardProps) {
  const location = [product.city, product.country].filter(Boolean).join(", ");
  const priceLabel = formatProductPrice(product.price, product.currency);
  const discount = getProductDiscountPercent(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md">
      <div className="relative">
        <ProductThumbnail
          className="aspect-square border-b border-slate-100 p-4"
          product={product}
        />
        {product.isOnOffer ? (
          <Badge
            className="absolute left-3 top-3 border-red-200 bg-red-600 text-white"
            variant="neutral"
          >
            Oferta
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category ? (
          <Badge className="w-fit" variant="brand">
            {product.category.name}
          </Badge>
        ) : null}

        <h2 className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-slate-900">
          {product.title}
        </h2>

        <div className="mt-3">
          {product.isOnOffer && product.compareAtPrice != null ? (
            <p className="text-xs text-slate-400 line-through">
              {formatProductPrice(product.compareAtPrice, product.currency)}
            </p>
          ) : null}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-xl font-bold text-slate-950">{priceLabel}</p>
            {discount != null ? (
              <span className="text-sm font-bold text-brand">
                {discount}% OFF
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <ProductRatingStars
            ratingAverage={product.ratingAverage}
            reviewCount={product.reviewCount}
            size="sm"
          />
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          {product.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span>{getConditionLabel(product.condition)}</span>
          {location ? (
            <span className="inline-flex items-center gap-0.5">
              <MapPin aria-hidden="true" className="h-3 w-3" />
              {location}
            </span>
          ) : null}
          {product.seller ? (
            <span>
              Vendedor {product.seller.reputationScore.toFixed(1)}★
            </span>
          ) : null}
        </div>

        <ProductCardMarketActions
          initialFavorited={initialFavorited}
          priceLabel={priceLabel}
          productId={product.id}
          sellerId={product.sellerId}
          title={product.title}
          viewerId={viewerId}
        />
      </div>
    </article>
  );
}
