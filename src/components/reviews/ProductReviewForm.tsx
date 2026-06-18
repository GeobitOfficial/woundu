"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { ZodError } from "zod";

import { Button } from "@/components/ui";
import {
  createProductReview,
  updateProductReview,
} from "@/features/reviews/services/reviewMutations";
import { cn } from "@/lib/utils";
import { productReviewSchema } from "@/validations/review";

type ProductReviewFormProps = Readonly<{
  productId: string;
  sellerId: string;
  productTitle: string;
  existingReview?: Readonly<{
    reviewId: string;
    rating: number;
    comment: string | null;
  }> | null;
  compact?: boolean;
}>;

export function ProductReviewForm({
  compact = false,
  existingReview = null,
  productId,
  productTitle,
  sellerId,
}: ProductReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      const values = productReviewSchema.parse({
        productId,
        sellerId,
        rating,
        comment,
      });

      if (existingReview?.reviewId) {
        const result = await updateProductReview(existingReview.reviewId, {
          rating: values.rating,
          comment: values.comment,
        });
        if (result.error) {
          setStatus(result.error);
          return;
        }
        setStatus("Reseña actualizada.");
      } else {
        const result = await createProductReview(values);
        if (result.error) {
          setStatus(result.error);
          return;
        }
        setStatus("Gracias por tu reseña.");
      }

      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof ZodError
          ? error.issues[0]?.message ?? "Revisa tu calificación."
          : "No pudimos guardar la reseña.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (existingReview && !compact) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Ya dejaste tu reseña</p>
        <p className="mt-2">
          Calificaste con {existingReview.rating} estrella
          {existingReview.rating === 1 ? "" : "s"}.
          {existingReview.comment ? ` "${existingReview.comment}"` : null}
        </p>
      </section>
    );
  }

  return (
    <form
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5",
        compact ? "shadow-sm" : "shadow-md",
      )}
      onSubmit={handleSubmit}
    >
      {!compact ? (
        <>
          <h2 className="text-lg font-bold text-slate-950">Califica tu compra</h2>
          <p className="mt-1 text-sm text-slate-600">{productTitle}</p>
        </>
      ) : (
        <p className="text-sm font-semibold text-slate-900">{productTitle}</p>
      )}

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-800">Calificación</p>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;
            const active = value <= rating;

            return (
              <button
                aria-label={`${value} estrella${value === 1 ? "" : "s"}`}
                className="rounded p-0.5 transition hover:scale-105"
                key={value}
                onClick={() => setRating(value)}
                type="button"
              >
                <Star
                  aria-hidden
                  className={cn(
                    "h-6 w-6",
                    active ? "fill-brand text-brand" : "text-slate-300",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-800">
          Comentario (opcional)
        </span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          maxLength={1000}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Cuéntanos tu experiencia con el producto y el vendedor."
          value={comment}
        />
      </label>

      {status ? (
        <p className="mt-3 rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-dark">
          {status}
        </p>
      ) : null}

      <Button className="mt-4" disabled={isSaving || rating < 1} type="submit">
        {isSaving
          ? "Guardando..."
          : existingReview?.reviewId
            ? "Actualizar reseña"
            : "Publicar reseña"}
      </Button>
    </form>
  );
}
