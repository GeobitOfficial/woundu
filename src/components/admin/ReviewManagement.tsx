"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";

import { Button, Input } from "@/components/ui";
import { deleteReviewAsAdmin } from "@/features/admin/services/adminMutations";
import type { AdminReviewRecord } from "@/features/admin/types";
import { formatAdminDate } from "@/lib/admin/labels";

type ReviewManagementProps = Readonly<{
  initialReviews: AdminReviewRecord[];
}>;

export function ReviewManagement({ initialReviews }: ReviewManagementProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [status, setStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      if (ratingFilter !== "all" && review.rating !== ratingFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        review.productTitle,
        review.reviewerName,
        review.sellerName,
        review.comment,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [ratingFilter, reviews, search]);

  async function handleDelete(review: AdminReviewRecord) {
    const confirmed = window.confirm(
      `¿Eliminar la reseña de ${review.rating} estrellas sobre "${review.productTitle}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(review.id);
    setStatus(null);

    const result = await deleteReviewAsAdmin(review.id);
    setDeletingId(null);

    if (result.error) {
      setStatus(result.error);
      return;
    }

    setReviews((current) => current.filter((item) => item.id !== review.id));
    setStatus("Reseña eliminada correctamente.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Input
        label="Buscar reseña"
        name="search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Producto, autor, vendedor o comentario"
        value={search}
      />

      <section className="flex flex-wrap gap-2">
        <FilterChip
          active={ratingFilter === "all"}
          label="Todas"
          onClick={() => setRatingFilter("all")}
        />
        {[5, 4, 3, 2, 1].map((rating) => (
          <FilterChip
            active={ratingFilter === rating}
            key={rating}
            label={`${rating}★`}
            onClick={() => setRatingFilter(rating as 1 | 2 | 3 | 4 | 5)}
          />
        ))}
      </section>

      {status ? (
        <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
          {status}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">
            Reseñas ({filteredReviews.length})
          </h2>
        </div>

        {filteredReviews.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-600">
            No hay reseñas que coincidan con los filtros.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <li className="px-5 py-4" key={review.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <ReviewStars rating={review.rating} />
                      <span className="text-xs text-slate-500">
                        {formatAdminDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-950">{review.productTitle}</p>
                    <p className="text-sm text-slate-600">
                      Por {review.reviewerName} · Vendedor: {review.sellerName}
                    </p>
                    {review.comment ? (
                      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {review.comment}
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-500">Sin comentario.</p>
                    )}
                  </div>
                  <Button
                    disabled={deletingId === review.id}
                    onClick={() => handleDelete(review)}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {deletingId === review.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: Readonly<{
  active: boolean;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-brand text-slate-950"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function ReviewStars({ rating }: Readonly<{ rating: number }>) {
  return (
    <div
      aria-label={`Calificación ${rating} de 5`}
      className="flex items-center gap-0.5"
      role="img"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          aria-hidden="true"
          className={
            index < rating
              ? "h-4 w-4 fill-brand text-brand"
              : "h-4 w-4 text-slate-200"
          }
          key={index}
        />
      ))}
    </div>
  );
}
