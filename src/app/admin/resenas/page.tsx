import { ReviewManagement } from "@/components/admin/ReviewManagement";
import { getAllReviewsForAdmin } from "@/features/admin/services/adminReadService";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviewsForAdmin();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Moderación de reseñas
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Revisa las calificaciones publicadas en el marketplace. Eliminar una reseña
          actualiza automáticamente el promedio del producto.
        </p>
      </section>

      <ReviewManagement initialReviews={reviews} />
    </div>
  );
}
