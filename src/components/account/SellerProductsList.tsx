import Link from "next/link";
import { ImageIcon, PencilLine } from "lucide-react";

import type { SellerProductListItem } from "@/features/products/services/sellerProductService";
import {
  SELLER_PRODUCT_STATUS_LABEL,
  SELLER_PRODUCT_STATUS_STYLE,
} from "@/lib/account/sellerProductStatusUi";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/utils/productDisplay";

type SellerProductsListProps = Readonly<{
  products: ReadonlyArray<SellerProductListItem>;
  previewLimit?: number;
}>;

export function SellerProductsList({
  products,
  previewLimit = 3,
}: SellerProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
        Aun no tienes publicaciones.{" "}
        <Link className="font-bold text-brand underline" href="/publicar">
          Publica tu primer producto
        </Link>
        .
      </div>
    );
  }

  const previewProducts = products.slice(0, previewLimit);

  return (
    <div className="mt-5 space-y-4">
      <ul className="space-y-3">
        {previewProducts.map((product) => {
          const imageUrl = getProductImageUrl(product.primaryImagePath);

          return (
            <li
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4"
              key={product.id}
            >
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                  {imageUrl ? (
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={imageUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <ImageIcon aria-hidden className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950 line-clamp-2">
                        {product.title}
                      </p>
                      <p className="mt-1 text-sm font-bold text-brand-dark">
                        {formatMoney(product.price, product.currency)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.categoryName ?? "Sin categoria"} ·{" "}
                        {product.country ?? "Sin pais"} · Stock: {product.stock}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-bold",
                          SELLER_PRODUCT_STATUS_STYLE[product.status] ??
                            "bg-brand-muted text-brand-dark",
                        )}
                      >
                        {SELLER_PRODUCT_STATUS_LABEL[product.status]}
                      </span>
                      <Link
                        className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-white px-3 py-1.5 text-xs font-bold text-brand-dark transition hover:bg-brand-light"
                        href={`/cuenta/productos/${product.id}/editar`}
                      >
                        <PencilLine aria-hidden className="h-3.5 w-3.5" />
                        Editar
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {products.length > 0 ? (
        <Link
          className="inline-flex rounded-full bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-hover"
          href="/cuenta/publicaciones"
        >
          Ver mis publicaciones
        </Link>
      ) : null}
    </div>
  );
}
