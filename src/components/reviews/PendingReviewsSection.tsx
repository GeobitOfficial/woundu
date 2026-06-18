import Link from "next/link";
import { Star } from "lucide-react";

import { ProductReviewForm } from "@/components/reviews/ProductReviewForm";
import type { PendingProductReview } from "@/features/reviews/types";
import { formatAccountDate } from "@/lib/account/orderStatusUi";

type PendingReviewsSectionProps = Readonly<{
  pendingReviews: ReadonlyArray<PendingProductReview>;
}>;

export function PendingReviewsSection({
  pendingReviews,
}: PendingReviewsSectionProps) {
  if (pendingReviews.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-sm">
      <div className="border-b border-amber-100/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Star aria-hidden className="h-4 w-4 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-950">Reseñas pendientes</h2>
            <p className="text-xs text-slate-500">
              Califica productos que ya recibiste.
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-3 p-5">
        {pendingReviews.slice(0, 4).map((item) => (
          <li
            className="rounded-2xl border border-amber-100 bg-white/90 p-4"
            key={item.productId}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-950">{item.productTitle}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Vendedor: {item.sellerName}
                  {item.completedAt
                    ? ` · ${formatAccountDate(item.completedAt)}`
                    : null}
                </p>
              </div>
              <Link
                className="text-xs font-bold text-brand hover:underline"
                href={`/cuenta/pedidos/${item.orderId}`}
              >
                Ver pedido
              </Link>
            </div>
            <div className="mt-4">
              <ProductReviewForm
                compact
                productId={item.productId}
                productTitle={item.productTitle}
                sellerId={item.sellerId}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
