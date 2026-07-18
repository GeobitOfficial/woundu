import { NextResponse } from "next/server";
import { sendOrderEmailsAction } from "@/features/orders/actions/orderEmailActions";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Ejecutar el envío de correos en el servidor
    const result = await sendOrderEmailsAction(orderId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error en API route de envío de correos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
