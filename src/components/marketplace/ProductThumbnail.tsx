import { Package } from "lucide-react";

import type { ProductCardItem } from "@/features/products";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/utils/productDisplay";

type ProductThumbnailProps = Readonly<{
  product: ProductCardItem;
  className?: string;
  imageClassName?: string;
  tone?: "light" | "dark";
}>;

export function ProductThumbnail({
  className,
  imageClassName,
  product,
  tone = "light",
}: ProductThumbnailProps) {
  const imageUrl = getProductImageUrl(product.primaryImage?.storagePath);
  const alt = product.primaryImage?.altText ?? product.title;
  const isDark = tone === "dark";

  if (imageUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden bg-transparent",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={alt}
          className={cn("h-full w-full object-cover", imageClassName)}
          decoding="async"
          loading="lazy"
          src={imageUrl}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        isDark
          ? "bg-slate-50 text-slate-400"
          : "bg-gradient-to-br from-slate-100 via-slate-50 to-brand-light text-slate-400",
        className,
      )}
    >
      <Package aria-hidden="true" className={cn("h-8 w-8", isDark ? "opacity-75" : "opacity-60")} />
      <span className="px-2 text-center text-[11px] font-medium">
        {product.category?.name ?? "Producto"}
      </span>
    </div>
  );
}
