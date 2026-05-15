import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui";
import type { ProductCardItem } from "@/features/products";

import { ProductCardMarketActions } from "./ProductCardMarketActions";

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
  const hasProductReviews = product.reviewCount > 0;
  const priceLabel = formatPrice(product.price, product.currency);

  return (
    <article className="group overflow-hidden rounded-3xl border border-emerald-100/50 bg-white/95 shadow-sm shadow-emerald-900/10 backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-200/60 hover:shadow-xl hover:shadow-emerald-900/15">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-950 via-slate-800 to-emerald-500 p-4">
        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
          {product.isOnOffer ? (
            <Badge
              className="border-amber-200 bg-amber-500 text-white"
              variant="neutral"
            >
              Oferta
            </Badge>
          ) : null}
        </div>
        <div className="flex h-full flex-col justify-end">
          {product.primaryImage ? (
            <p className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              Imagen lista
            </p>
          ) : (
            <p className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              Sin imagen
            </p>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {product.category ? (
              <Badge variant="brand">{product.category.name}</Badge>
            ) : null}
            <h2 className="mt-3 line-clamp-2 text-lg font-bold text-slate-950">
              {product.title}
            </h2>
          </div>
          <div className="shrink-0 text-right">
            {product.isOnOffer && product.compareAtPrice != null ? (
              <p className="text-xs font-medium text-slate-400 line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </p>
            ) : null}
            <p className="text-lg font-black text-slate-950">{priceLabel}</p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
          {product.description}
        </p>

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <Star
                aria-hidden="true"
                className={
                  hasProductReviews ? "h-4 w-4 text-amber-400" : "h-4 w-4 text-slate-300"
                }
              />
              <span>
                {hasProductReviews
                  ? `${product.ratingAverage.toFixed(1)} · ${product.reviewCount} reseña${product.reviewCount === 1 ? "" : "s"}`
                  : "Sin reseñas aún"}
              </span>
            </span>
            {location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                {location}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Star aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Vendedor:{" "}
              <span className="font-medium text-slate-600">
                {product.seller?.reputationScore.toFixed(1) ?? "—"}
              </span>{" "}
              reputación
            </span>
          </div>
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

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
