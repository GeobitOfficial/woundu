import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { OrderDetailPanel } from "@/components/orders/OrderDetailPanel";
import { getOrderDetailForViewer } from "@/features/orders/services/orderReadService";
import { getAuthenticatedUser } from "@/services/supabase/auth/getAuthenticatedUser";

type OrderDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export const metadata: Metadata = {
  title: "Detalle del pedido",
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login?next=%2Fcuenta");
  }

  const { id } = await params;
  const order = await getOrderDetailForViewer(id);

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-light/20 via-white to-slate-50/80">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-950">
          {order.viewerRole === "seller" ? "Venta" : "Tu compra"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Coordina el pago directo con el vendedor sin pasarela en Woundu.
        </p>
        <div className="mt-6">
          <OrderDetailPanel order={order} />
        </div>
      </div>
    </main>
  );
}
