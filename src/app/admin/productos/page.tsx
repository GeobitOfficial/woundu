import type { Metadata } from "next";

import { ProductAdminPanel } from "@/components/admin/ProductAdminPanel";
import {
  getAllProductsForAdmin,
  getDeletedProductsForAdmin,
} from "@/features/admin/services/adminReadService";

export const metadata: Metadata = {
  title: "Moderación de productos",
};

export default async function AdminProductsPage() {
  const [products, deletedProducts] = await Promise.all([
    getAllProductsForAdmin(),
    getDeletedProductsForAdmin(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Productos de la plataforma
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Revisa publicaciones activas, modera estados o restaura productos
          eliminados (soft delete).
        </p>
      </div>

      <ProductAdminPanel
        initialDeletedProducts={deletedProducts}
        initialProducts={products}
      />
    </div>
  );
}
