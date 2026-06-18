import type { Metadata } from "next";

import { PaymentManagement } from "@/components/admin/PaymentManagement";
import {
  getAllDisputesForAdmin,
  getAllOrdersForAdmin,
} from "@/features/admin/services/adminReadService";

export const metadata: Metadata = {
  title: "Pagos y reembolsos",
};

export default async function AdminPaymentsPage() {
  const [orders, disputes] = await Promise.all([
    getAllOrdersForAdmin(),
    getAllDisputesForAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Pagos, disputas y reembolsos
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Flujos guiados para confirmar pagos, registrar disputas y procesar
          reembolsos con trazabilidad en auditoría.
        </p>
      </section>

      <PaymentManagement initialDisputes={disputes} initialOrders={orders} />
    </div>
  );
}
