import { Star, User } from "lucide-react";

import type { ProductSeller } from "@/features/products/types";
import { getAvatarUrl, getInitials } from "@/lib/avatars/getAvatarUrl";

type ProductSellerCardProps = Readonly<{
  seller: ProductSeller;
}>;

export function ProductSellerCard({ seller }: ProductSellerCardProps) {
  const avatarUrl = getAvatarUrl(seller.avatarUrl);
  const initials = getInitials(seller.fullName);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
        Vendedor
      </h2>

      <div className="mt-4 flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-brand-light/40">
          {avatarUrl ? (
            <img
              alt=""
              className="h-full w-full object-cover"
              src={avatarUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand/10 text-sm font-black text-brand-dark">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-slate-950">{seller.fullName}</p>
          {seller.username ? (
            <p className="text-sm text-slate-500">@{seller.username}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {seller.reviewsCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                <Star
                  aria-hidden
                  className="h-4 w-4 fill-brand text-brand"
                />
                {seller.reputationScore.toFixed(1)}
                <span className="font-normal text-slate-500">
                  ({seller.reviewsCount}{" "}
                  {seller.reviewsCount === 1 ? "reseña" : "reseñas"})
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-500">
                <User aria-hidden className="h-4 w-4" />
                Vendedor en Woundu
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
