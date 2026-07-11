import Link from "next/link";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui";
import type { ProductCardItem } from "@/features/products";
import {
  formatProductPrice,
  getProductDiscountPercent,
  getProductMarketplaceHref,
  getProductStockLabel,
  isProductInStock,
} from "@/utils/productDisplay";

import { ProductCardMarketActions } from "./ProductCardMarketActions";
import { ProductRatingStars } from "./ProductRatingStars";
import { ProductThumbnail } from "./ProductThumbnail";

type ProductCardProps = Readonly<{
  buyerPurchaseContext?: Readonly<{
    isBuyer: boolean;
    shippingComplete: boolean;
  }>;
  product: ProductCardItem;
  viewerId: string | null;
  initialFavorited: boolean;
}>;

export function ProductCard({
  buyerPurchaseContext,
  initialFavorited,
  product,
  viewerId,
}: ProductCardProps) {
  const href = getProductMarketplaceHref(product);
  const location = [product.city, product.country].filter(Boolean).join(", ");
  const priceLabel = formatProductPrice(product.price, product.currency);
  const discount = getProductDiscountPercent(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-slate-100 bg-slate-50 transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <Link
        aria-label={`Ver detalle de ${product.title}`}
        className="flex flex-1 flex-col outline-offset-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        href={href}
      >
        <div className="relative">
          <ProductThumbnail
            className="aspect-[5/4] border-b border-white/10 p-2"
            imageClassName="max-h-[7.5rem] object-contain"
            product={product}
            tone="dark"
          />
          {product.isOnOffer ? (
            <Badge
              className="pointer-events-none absolute left-2 top-2 border-red-200 bg-red-600 px-1.5 py-0 text-[10px] text-white"
              variant="neutral"
            >
              Oferta
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          {product.category ? (
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-brand">
              {product.category.name}
            </p>
          ) : null}

          <h2 className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-slate-900 transition group-hover:text-brand sm:text-sm">
            {product.title}
          </h2>

          <div className="mt-1.5">
            {product.isOnOffer && product.compareAtPrice != null ? (
              <p className="text-[10px] text-slate-400 line-through sm:text-xs">
                {formatProductPrice(product.compareAtPrice, product.currency)}
              </p>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <p className="text-base font-bold text-slate-950 sm:text-lg">{priceLabel}</p>
              {discount != null ? (
                <span className="text-[11px] font-bold text-brand sm:text-xs">
                  -{discount}%
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-1.5 space-y-1">
            <ProductRatingStars
              ratingAverage={product.ratingAverage}
              reviewCount={product.reviewCount}
              size="sm"
            />
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 sm:text-[11px]">
              <span
                className={
                  isProductInStock(product.stock) ? "text-emerald-700" : "text-red-600"
                }
              >
                {getProductStockLabel(product.stock)}
              </span>
              {location ? (
                <span className="inline-flex min-w-0 items-center gap-0.5">
                  <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      <div className="relative z-[1] px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        <ProductCardMarketActions
          buyerShippingComplete={buyerPurchaseContext?.shippingComplete ?? true}
          compact
          initialFavorited={initialFavorited}
          isBuyer={buyerPurchaseContext?.isBuyer ?? false}
          loginNextHref={href}
          priceLabel={priceLabel}
          productId={product.id}
          productPageUrl={href}
          productSlug={product.slug}
          sellerId={product.sellerId}
          sellerWhatsapp={product.seller?.whatsapp ?? null}
          sellerIsAdmin={
            product.seller?.role === "admin" || product.seller?.role === "super_admin"
          }
          shippingType={product.shippingType}
          stock={product.stock}
          title={product.title}
          viewerId={viewerId}
        />
      </div>
    </article>
  );
}
