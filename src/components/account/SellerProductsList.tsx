import Link from "next/link";
import { PencilLine, Package } from "lucide-react";

import type { SellerProductListItem } from "@/features/products/services/sellerProductService";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types";

const STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  paused: "Pausado",
  sold: "Vendido",
  archived: "Archivado",
  pending_review: "En revision",
  rejected: "Rechazado",
};

const STATUS_STYLE: Partial<Record<ProductStatus, string>> = {
  active: "bg-emerald-100 text-emerald-900",
  pending_review: "bg-amber-100 text-amber-900",
  rejected: "bg-red-100 text-red-900",
  paused: "bg-slate-200 text-slate-800",
};

type SellerProductsListProps = Readonly<{
  products: ReadonlyArray<SellerProductListItem>;
}>;

export function SellerProductsList({ products }: SellerProductsListProps) {
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

  return (
    <ul className="mt-5 space-y-3">
      {products.map((product) => (
        <li
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
          key={product.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <Package aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold text-slate-950 line-clamp-2">
                    {product.title}
                  </p>
                  <p className="mt-1 text-sm font-bold text-brand-dark">
                    {formatMoney(product.price, product.currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {product.country ?? "Sin pais"} · {product.currency}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  STATUS_STYLE[product.status] ?? "bg-brand-muted text-brand-dark",
                )}
              >
                {STATUS_LABEL[product.status]}
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
        </li>
      ))}
    </ul>
  );
}
