"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Loader2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui";
import { setProductFavorite } from "@/features/favorites/services/favoriteMutations";
import { cn } from "@/lib/utils";
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
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  const href = getProductMarketplaceHref(product);
  const location = [product.city, product.country].filter(Boolean).join(", ");
  const priceLabel = formatProductPrice(product.price, product.currency);
  const discount = getProductDiscountPercent(product);

  const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!viewerId) {
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    setFavoriteBusy(true);
    const next = !favorited;
    const { error } = await setProductFavorite(product.id, next);
    setFavoriteBusy(false);
    if (!error) {
      setFavorited(next);
      router.refresh();
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-slate-100 bg-slate-50 transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <Link
        aria-label={`Ver detalle de ${product.title}`}
        className="flex flex-1 flex-col outline-offset-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        href={href}
      >
        <div className="relative">
          <ProductThumbnail
            className="aspect-[5/4] border-b border-slate-100 p-0"
            imageClassName="w-full h-full object-cover"
            product={product}
            tone="light"
          />
          {product.isOnOffer ? (
            <Badge
              className="pointer-events-none absolute left-2 top-2 border-red-200 bg-red-600 px-1.5 py-0 text-[10px] text-white"
              variant="neutral"
            >
              Oferta
            </Badge>
          ) : null}

          <button
            aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
            className={cn(
              "absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-105 hover:text-rose-600 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand",
              favorited ? "text-rose-600 opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            disabled={favoriteBusy}
            onClick={handleFavoriteClick}
            type="button"
          >
            {favoriteBusy ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                aria-hidden
                className={cn("h-4 w-4 transition-transform active:scale-90", favorited && "fill-current")}
              />
            )}
          </button>
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
