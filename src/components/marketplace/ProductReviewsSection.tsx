import { ProductRatingStars } from "@/components/marketplace/ProductRatingStars";
import type { ProductReviewPublic } from "@/features/reviews/types";
import { formatAccountDate } from "@/lib/account/orderStatusUi";

type ProductReviewsSectionProps = Readonly<{
  reviews: ReadonlyArray<ProductReviewPublic>;
  ratingAverage: number;
  reviewCount: number;
}>;

export function ProductReviewsSection({
  ratingAverage,
  reviewCount,
  reviews,
}: ProductReviewsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">Opiniones de compradores</h2>
          <p className="mt-1 text-sm text-slate-600">
            {reviewCount === 0
              ? "Este producto aun no tiene reseñas publicadas."
              : `${reviewCount} ${reviewCount === 1 ? "reseña" : "reseñas"} verificadas`}
          </p>
        </div>
        {reviewCount > 0 ? (
          <ProductRatingStars
            ratingAverage={ratingAverage}
            reviewCount={reviewCount}
          />
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
              key={review.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">
                  {review.reviewerName}
                </p>
                <time
                  className="text-xs text-slate-500"
                  dateTime={review.createdAt}
                >
                  {formatAccountDate(review.createdAt)}
                </time>
              </div>
              <div className="mt-2">
                <ProductRatingStars
                  ratingAverage={review.rating}
                  reviewCount={1}
                  size="sm"
                />
              </div>
              {review.comment ? (
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {review.comment}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
