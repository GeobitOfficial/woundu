import type { Metadata } from "next";

import { ProductManagement } from "@/components/admin";
import { getAllProductsForAdmin } from "@/features/admin/services/adminReadService";

export const metadata: Metadata = {
  title: "Moderación de productos",
};

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Productos de la plataforma
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Revisa todas las publicaciones, edítalas y cambia su estado entre
          pendiente, disponible o rechazado.
        </p>
      </div>

      <ProductManagement initialProducts={products} />
    </div>
  );
}
