"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

type WompiCheckoutData = {
  reference: string;
  amount_in_cents: number;
  currency: string;
  signature: string;
  public_key: string;
  redirect_url: string;
  customer_email?: string;
};

export default function WompiCheckoutPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true);

    // Obtener los datos del sessionStorage
    const checkoutDataStr = sessionStorage.getItem("wompi-checkout-data");
    if (!checkoutDataStr) {
      router.push("/marketplace");
      return;
    }

    const checkoutData = JSON.parse(checkoutDataStr) as WompiCheckoutData;

    // Cargar el script de Wompi
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    
    script.onload = () => {
      // Esperar a que WidgetCheckout esté disponible
      const checkWidget = setInterval(() => {
        if (window.WidgetCheckout && containerRef.current) {
          clearInterval(checkWidget);
          setIsLoading(false);
          
          try {
            const checkout = new window.WidgetCheckout({
              currency: checkoutData.currency,
              amountInCents: checkoutData.amount_in_cents,
              reference: checkoutData.reference,
              publicKey: checkoutData.public_key,
              redirectUrl: checkoutData.redirect_url,
              signature: {
                integrity: checkoutData.signature,
              },
              customerData: {
                email: checkoutData.customer_email,
              },
            });

            checkout.open((result: any) => {
              const transaction = result?.transaction;
              if (transaction?.id) {
                console.log("Wompi transaction created:", transaction.id);
              }
            });
          } catch (err) {
            console.error("Error rendering Wompi widget:", err);
            setIsLoading(false);
          }
        }
      }, 100);

      // Timeout después de 5 segundos
      setTimeout(() => {
        clearInterval(checkWidget);
        setIsLoading(false);
      }, 5000);
    };

    script.onerror = () => {
      console.error("Error loading Wompi widget script");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      sessionStorage.removeItem("wompi-checkout-data");
    };
  }, [router]);

  // No renderizar nada hasta que estemos en el cliente
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Completar pago</h1>
        <p className="text-slate-600 mb-8">
          Completa tu información de pago a continuación
        </p>

        {/* Contenedor para el Widget de Wompi */}
        <div
          ref={containerRef}
          className="bg-slate-50 rounded-lg p-6 border border-slate-200"
        >
          {isLoading && (
            <p className="text-slate-500 text-center py-12">
              Cargando formulario de pago...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
