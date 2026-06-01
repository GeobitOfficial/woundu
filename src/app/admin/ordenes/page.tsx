import type { Metadata } from "next";

import { OrderManagement } from "@/components/admin";
import { getAllOrdersForAdmin } from "@/features/admin/services/adminReadService";

export const metadata: Metadata = {
  title: "Registro de compras",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersForAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Registro de compras y ventas
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Historial completo de operaciones con producto, comprador, vendedor,
          fecha y ubicación del producto. Puedes cambiar el estado de cada pedido.
        </p>
      </div>

      <OrderManagement initialOrders={orders} />
    </div>
  );
}
