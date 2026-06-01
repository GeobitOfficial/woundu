import { Star } from "lucide-react";

type ProductRatingStarsProps = Readonly<{
  ratingAverage: number;
  reviewCount: number;
  size?: "sm" | "md";
}>;

export function ProductRatingStars({
  ratingAverage,
  reviewCount,
  size = "md",
}: ProductRatingStarsProps) {
  const starClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const hasReviews = reviewCount > 0;

  return (
    <div
      aria-label={
        hasReviews
          ? `Calificación ${ratingAverage.toFixed(1)} de 5, ${reviewCount} reseñas`
          : "Sin reseñas todavía"
      }
      className="flex flex-wrap items-center gap-1.5"
      role="img"
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const filled = hasReviews && ratingAverage >= starValue - 0.25;
          const half =
            hasReviews &&
            !filled &&
            ratingAverage >= starValue - 0.75 &&
            ratingAverage < starValue;

          return (
            <Star
              aria-hidden="true"
              className={
                filled
                  ? `${starClass} fill-brand text-brand`
                  : half
                    ? `${starClass} fill-brand/40 text-brand`
                    : `${starClass} text-slate-200`
              }
              key={starValue}
            />
          );
        })}
      </div>
      {hasReviews ? (
        <span className="text-xs font-medium text-slate-700">
          {ratingAverage.toFixed(1)}{" "}
          <span className="text-slate-400">
            ({reviewCount} reseña{reviewCount === 1 ? "" : "s"})
          </span>
        </span>
      ) : (
        <span className="text-xs text-slate-400">Sin reseñas aún</span>
      )}
    </div>
  );
}
