import Link from "next/link";
import { MapPin } from "lucide-react";

import type { ProductCardItem } from "@/features/products";
import { cn } from "@/lib/utils";
import {
  formatProductPrice,
  getProductDiscountPercent,
  getProductMarketplaceHref,
} from "@/utils/productDisplay";

import { ProductRatingStars } from "./ProductRatingStars";
import { ProductThumbnail } from "./ProductThumbnail";

export type HomeVitrineCardVariant =
  | "compact"
  | "elevated"
  | "spotlight"
  | "deal"
  | "bento";

type HomeVitrineCardProps = Readonly<{
  product: ProductCardItem;
  variant?: HomeVitrineCardVariant;
  className?: string;
}>;

export function HomeVitrineCard({
  className,
  product,
  variant = "elevated",
}: HomeVitrineCardProps) {
  const href = getProductMarketplaceHref(product);
  const discount = getProductDiscountPercent(product);

  return (
    <Link
      className={cn(getCardShellClasses(variant), className)}
      href={href}
    >
      {variant === "deal" && discount != null ? (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          -{discount}%
        </span>
      ) : null}

      {product.country ? (
        <span className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <MapPin aria-hidden="true" className="h-3 w-3 text-brand" />
          {product.country}
        </span>
      ) : null}

      <ProductThumbnail
        className={cn(
          "aspect-square w-full",
          variant === "spotlight" ? "p-4" : "p-3",
        )}
        product={product}
      />

      <div className="flex flex-1 flex-col pt-2">
        <h3
          className={cn(
            "line-clamp-2 font-medium text-slate-900 group-hover:text-brand",
            variant === "bento" ? "text-base leading-6" : "text-sm leading-5",
          )}
        >
          {product.title}
        </h3>

        <div className="mt-2">
          {product.isOnOffer && product.compareAtPrice != null ? (
            <p className="text-xs text-slate-400 line-through">
              {formatProductPrice(product.compareAtPrice, product.currency)}
            </p>
          ) : (
            <p className="text-xs select-none text-transparent">
              &nbsp;
            </p>
          )}
          <p
            className={cn(
              "font-semibold text-slate-950",
              variant === "spotlight" || variant === "bento"
                ? "text-2xl"
                : "text-lg",
            )}
          >
            {formatProductPrice(product.price, product.currency)}
          </p>
        </div>

        <div className="mt-auto pt-3">
          <ProductRatingStars
            ratingAverage={product.ratingAverage}
            reviewCount={product.reviewCount}
          />
        </div>
      </div>
    </Link>
  );
}

function getCardShellClasses(variant: HomeVitrineCardVariant): string {
  const base =
    "group relative flex h-full flex-col bg-white transition duration-200";

  switch (variant) {
    case "compact":
      return cn(base, "min-w-[10.5rem] max-w-[10.5rem] shrink-0 p-3 sm:min-w-[12rem] sm:max-w-[12rem]");
    case "spotlight":
      return cn(
        base,
        "min-w-[14rem] max-w-[14rem] shrink-0 rounded-2xl p-4 shadow-xl ring-1 ring-white/10 sm:min-w-[15rem] sm:max-w-[15rem]",
      );
    case "deal":
      return cn(
        base,
        "min-w-[11rem] max-w-[11rem] shrink-0 rounded-xl border border-brand/20 p-3 shadow-sm sm:min-w-[12.5rem] sm:max-w-[12.5rem]",
      );
    case "bento":
      return cn(
        base,
        "rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-lg",
      );
    case "elevated":
    default:
      return cn(
        base,
        "min-w-[11.5rem] max-w-[11.5rem] shrink-0 rounded-xl p-3 shadow-md hover:-translate-y-0.5 hover:shadow-xl sm:min-w-[13rem] sm:max-w-[13rem]",
      );
  }
}
