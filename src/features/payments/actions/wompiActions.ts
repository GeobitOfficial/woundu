"use server";

import { createSupabaseServerClient } from "@/services/supabase/server";
import { sendOrderEmailsAction } from "@/features/orders/actions/orderEmailActions";

type VerificationResult = {
  success: boolean;
  status: "APPROVED" | "DECLINED" | "PENDING" | "ERROR" | "NOT_FOUND";
  error: string | null;
};

/**
 * Verifica una transacción en Wompi usando su API pública y actualiza el pedido en Supabase.
 */
export async function verifyWompiTransactionAction(wompiTxId: string): Promise<VerificationResult> {
  if (!wompiTxId || wompiTxId.trim() === "") {
    return { success: false, status: "NOT_FOUND", error: "ID de transacción no válido" };
  }

  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  if (!publicKey) {
    console.warn("WOMPI_PUBLIC_KEY no está configurada.");
  }

  // Determinar si es entorno de pruebas (sandbox) o producción
  const isSandbox = !publicKey || publicKey.startsWith("pub_test_");
  const wompiApiUrl = isSandbox
    ? `https://sandbox.wompi.co/v1/transactions/${wompiTxId}`
    : `https://production.wompi.co/v1/transactions/${wompiTxId}`;

  try {
    // Consultar el estado de la transacción directamente en Wompi
    const response = await fetch(wompiApiUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      next: { revalidate: 0 }, // Evitar caché para obtener el estado en tiempo real
    });

    if (!response.ok) {
      console.error(`Error consultando Wompi API (${response.status})`);
      return { success: false, status: "ERROR", error: `Error de API Wompi: HTTP ${response.status}` };
    }

    const json = await response.json();
    const txData = json?.data;

    if (!txData) {
      return { success: false, status: "NOT_FOUND", error: "Transacción no encontrada en Wompi" };
    }

    const status = txData.status; // APPROVED, DECLINED, PENDING, VOIDED, ERROR
    const orderId = txData.reference; // La referencia enviada a Wompi (nuestro UUID de pedido)

    console.log(`Wompi TX ${wompiTxId} para pedido ${orderId}. Estado: ${status}`);

    if (status === "APPROVED") {
      const supabase = await createSupabaseServerClient();
      if (!supabase) {
        return { success: false, status: "APPROVED", error: "Error interno de base de datos" };
      }

      // Buscar si el pedido ya está en estado "paid" o similar
      const { data: order, error: queryError } = await supabase
        .from("orders")
        .select("id, status")
        .eq("id", orderId)
        .maybeSingle();

      if (queryError) {
        console.error("Error consultando pedido en Supabase:", queryError);
        return { success: false, status: "APPROVED", error: "Error consultando pedido" };
      }

      if (!order) {
        console.error(`Pedido ${orderId} no encontrado en la base de datos.`);
        return { success: false, status: "APPROVED", error: "Pedido no encontrado" };
      }

      // Si el pedido está pendiente, lo marcamos como pagado
      if (order.status === "pending") {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_reference: wompiTxId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (updateError) {
          console.error("Error actualizando pedido a 'paid' en Supabase:", updateError);
          return { success: false, status: "APPROVED", error: "Error al actualizar pedido" };
        }

        console.log(`Pedido ${orderId} actualizado a 'paid' tras verificación directa de Wompi.`);

        // Disparar envío de correos confirmatorios
        void sendOrderEmailsAction(orderId);
      }

      return { success: true, status: "APPROVED", error: null };
    }

    if (status === "DECLINED") {
      return { success: true, status: "DECLINED", error: "El pago fue rechazado por la pasarela" };
    }

    if (status === "PENDING") {
      return { success: true, status: "PENDING", error: null };
    }

    return { success: true, status: "ERROR", error: `Estado de transacción inesperado: ${status}` };
  } catch (error) {
    console.error("Error en verifyWompiTransactionAction:", error);
    return {
      success: false,
      status: "ERROR",
      error: error instanceof Error ? error.message : "Error de red consultando Wompi",
    };
  }
}
