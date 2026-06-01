import type { Metadata } from "next";

import { CategoryManagement } from "@/components/admin";
import { getAllCategoriesForAdmin } from "@/features/categories/services/categoryService";

export const metadata: Metadata = {
  title: "Categorías del marketplace",
};

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Categorías del marketplace
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Las categorías activas se muestran en el marketplace, formularios de
          publicación y filtros. Usa el orden para controlar su posición en la
          navegación.
        </p>
      </div>

      <CategoryManagement initialCategories={categories} />
    </div>
  );
}
