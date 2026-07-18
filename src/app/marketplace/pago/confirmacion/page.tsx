"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Loader2, ArrowLeft } from "lucide-react";
import { verifyWompiTransactionAction } from "@/features/payments/actions/wompiActions";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"APPROVED" | "DECLINED" | "PENDING" | "ERROR" | "NOT_FOUND" | "GENERIC">("GENERIC");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionId) {
      // Si no hay ID en la URL, mostramos la vista genérica de éxito tras 3 segundos
      setLoading(false);
      const timeout = window.setTimeout(() => {
        router.push("/cuenta/compras");
      }, 4000);
      return () => window.clearTimeout(timeout);
    }

    let isMounted = true;

    async function verifyPayment() {
      try {
        const result = await verifyWompiTransactionAction(transactionId!);
        if (!isMounted) return;

        setLoading(false);
        if (result.success) {
          setStatus(result.status);
          if (result.status === "APPROVED") {
            // Si el pago está aprobado, redirigir a mis compras en 5 segundos
            setTimeout(() => {
              if (isMounted) router.push("/cuenta/compras");
            }, 5000);
          }
        } else {
          setStatus("ERROR");
          setErrorMessage(result.error || "No pudimos validar el estado de tu pago.");
        }
      } catch (err) {
        if (!isMounted) return;
        setLoading(false);
        setStatus("ERROR");
        setErrorMessage("Ocurrió un error inesperado al conectar con el servidor.");
      }
    }

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [transactionId, router]);

  if (loading) {
    return (
      <div className="text-center p-8 max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100">
        <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Verificando tu pago</h1>
        <p className="mt-2 text-sm text-slate-500">
          Estamos consultando el estado de tu transacción con la pasarela de pagos. Por favor, no cierres esta ventana.
        </p>
      </div>
    );
  }

  // Vista de Éxito (Aprobado)
  if (status === "APPROVED" || status === "GENERIC") {
    return (
      <div className="text-center p-8 max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 transition-all">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-slate-950">¡Pago Aprobado!</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Tu transacción se completó con éxito. Hemos enviado un correo con la confirmación de compra y detalles al vendedor.
        </p>
        {transactionId && (
          <p className="mt-2 text-xs font-mono text-slate-400 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 inline-block">
            Ref: {transactionId.slice(0, 18)}...
          </p>
        )}
        <p className="mt-5 text-xs text-slate-400 animate-pulse">
          Redireccionando a tus compras en unos segundos...
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/cuenta/compras"
            className={cn(buttonVariants({ variant: "primary" }), "w-full")}
          >
            Ir a mis compras
          </Link>
        </div>
      </div>
    );
  }

  // Vista de Pendiente
  if (status === "PENDING") {
    return (
      <div className="text-center p-8 max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100">
        <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-slate-950">Pago en Proceso</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          La pasarela de pago está procesando tu transacción. Esto puede tomar unos minutos dependiendo de tu banco.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Te enviaremos una confirmación por correo electrónico tan pronto como el pago sea aprobado.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/cuenta/compras"
            className={cn(buttonVariants({ variant: "primary" }), "w-full")}
          >
            Ver mis compras
          </Link>
          <Link
            href="/marketplace"
            className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Vista de Rechazado / Error
  return (
    <div className="text-center p-8 max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100">
      <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h1 className="text-2xl font-black text-slate-950">Pago no completado</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {errorMessage || "La transacción fue rechazada por la entidad bancaria o cancelada."}
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="/marketplace"
          className={cn(buttonVariants({ variant: "primary" }), "w-full")}
        >
          Volver a intentarlo
        </Link>
        <Link
          href="/cuenta/compras"
          className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
        >
          Ver mis compras
        </Link>
      </div>
    </div>
  );
}

function ConfirmationLoading() {
  return (
    <div className="text-center p-8 max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100">
      <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
      <h1 className="text-xl font-bold text-slate-900">Cargando confirmación...</h1>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <Suspense fallback={<ConfirmationLoading />}>
        <ConfirmationContent />
      </Suspense>
    </main>
  );
}
