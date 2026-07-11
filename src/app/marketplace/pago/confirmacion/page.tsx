"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentConfirmationPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.push("/cuenta/compras");
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="rounded-md bg-white p-8 shadow">
        <h1 className="text-xl font-bold">Producto comprado</h1>
        <p className="mt-4 text-sm text-slate-600">
          Gracias. Tu pago quedó registrado y en unos segundos volverás a tus compras.
        </p>
        <div className="mt-6">
          <Link
            href="/cuenta/compras"
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ir a mis compras
          </Link>
        </div>
      </div>
    </main>
  );
}
