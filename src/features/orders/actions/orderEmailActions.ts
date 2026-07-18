"use server";

import { createSupabaseServerClient } from "@/services/supabase/server";
import { sendTransactionalEmail } from "@/lib/brevo/sendEmail";
import { getSellerPayoutProfileForUser } from "@/features/account/services/payoutReadService";
import { formatMoney } from "@/lib/currency/formatMoney";

type EmailResult = {
  success: boolean;
  error: string | null;
};

export async function sendOrderEmailsAction(orderId: string): Promise<EmailResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  // 1. Obtener la orden y los datos de comprador
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      id,
      total,
      currency,
      buyer_id,
      profiles!orders_buyer_id_fkey (
        full_name,
        email,
        phone,
        country,
        shipping_city,
        shipping_address
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    console.error("Error obteniendo la orden para enviar correo:", orderError);
    return { success: false, error: "Order not found" };
  }

  // 2. Obtener los ítems de la orden y datos del vendedor
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      id,
      product_id,
      seller_id,
      quantity,
      unit_price,
      total_price,
      products ( title, slug ),
      profiles!order_items_seller_id_fkey (
        full_name,
        email,
        phone
      )
    `)
    .eq("order_id", orderId);

  if (itemsError || !items || items.length === 0) {
    console.error("Error obteniendo los ítems de la orden para enviar correo:", itemsError);
    return { success: false, error: "Order items not found" };
  }

  const buyer = order.profiles as any;
  const item = items[0] as any;
  const product = item.products as any;
  const seller = item.profiles as any;

  if (!buyer || !seller) {
    return { success: false, error: "Buyer or seller profile not found" };
  }

  const orderIdShort = order.id.slice(0, 8);
  const formattedTotal = formatMoney(Number(order.total), order.currency);

  // Obtener métodos de pago del vendedor
  const sellerPayout = await getSellerPayoutProfileForUser(item.seller_id);

  // (Enlace de WhatsApp temporalmente omitido)

  // --- CORREO AL COMPRADOR ---
  let payoutHtml = "";
  if (sellerPayout && sellerPayout.methods.length > 0) {
    payoutHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 16px;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Métodos de Pago del Vendedor</h3>
        <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">Utiliza uno de estos métodos para transferir directamente al vendedor:</p>
        <ul style="padding-left: 20px; margin: 0; color: #334155; font-size: 14px;">
    `;
    sellerPayout.methods.forEach((method) => {
      payoutHtml += `
        <li style="margin-bottom: 10px;">
          <strong>${method.entityName}</strong> (${method.accountType === "savings" ? "Ahorros" : method.accountType === "checking" ? "Corriente" : "Otro"}):<br/>
          Titular: ${method.accountHolder}<br/>
          Número: <code style="background-color: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${method.accountNumber}</code>
          ${method.instructions ? `<br/><span style="color: #64748b; font-size: 12px; font-style: italic;">Nota: ${method.instructions}</span>` : ""}
        </li>
      `;
    });
    payoutHtml += `
        </ul>
      </div>
    `;
  } else {
    payoutHtml = `
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin-top: 16px; color: #92400e;">
        <p style="margin: 0; font-size: 14px;">
          El vendedor no ha configurado sus métodos de pago en el perfil. Puedes coordinar el pago directamente con él utilizando sus datos de contacto.
        </p>
      </div>
    `;
  }

  const buyerMailHtml = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">¡Tu solicitud de compra ha sido creada!</h2>
      <p style="font-size: 16px; line-height: 1.5;">Hola <strong>${buyer.full_name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.5;">Hemos registrado tu interés en el producto <strong>${product?.title}</strong> del vendedor <strong>${seller?.full_name}</strong>.</p>
      
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Pedido:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: bold; font-family: monospace;">#${orderIdShort}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Producto:</td>
            <td style="padding: 4px 0; text-align: right;">${product?.title}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Cantidad:</td>
            <td style="padding: 4px 0; text-align: right;">${item.quantity}</td>
          </tr>
          <tr style="border-top: 1px solid #cbd5e1;">
            <td style="padding: 8px 0 0 0; font-weight: bold; font-size: 16px;">Total:</td>
            <td style="padding: 8px 0 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #0284c7;">${formattedTotal}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 15px; font-weight: bold; margin-top: 25px;">Próximo paso para concretar tu compra:</p>
      <p style="font-size: 14px; line-height: 1.5; color: #475569;">
        Coordinar el pago y el envío directamente con el vendedor. Woundu no procesa pagos en línea para esta publicación.
      </p>

      <!-- Enlace de WhatsApp temporalmente deshabilitado -->

      ${payoutHtml}

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Este es un correo automático enviado por Woundu Marketplace. Por favor, no respondas a este mensaje.
      </p>
    </div>
  `;

  // --- CORREO AL VENDEDOR ---
  const sellerMailHtml = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">¡Tienes un nuevo interesado en tu producto!</h2>
      <p style="font-size: 16px; line-height: 1.5;">Hola <strong>${seller.full_name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.5;">El usuario <strong>${buyer.full_name}</strong> ha registrado una intención de compra para tu producto <strong>${product?.title}</strong>.</p>
      
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin-top: 0; font-size: 15px; color: #334155;">Datos del Comprador y Envío:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 120px;">Nombre:</td>
            <td style="padding: 4px 0; font-weight: bold;">${buyer.full_name}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Teléfono:</td>
            <td style="padding: 4px 0;">
              ${buyer.phone ? `<a href="tel:${buyer.phone}" style="color: #0284c7; text-decoration: none;">${buyer.phone}</a>` : "No provisto"}
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">País:</td>
            <td style="padding: 4px 0;">${buyer.country || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Ciudad de envío:</td>
            <td style="padding: 4px 0;">${buyer.shipping_city || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Dirección:</td>
            <td style="padding: 4px 0;">${buyer.shipping_address || "-"}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #dbeafe; color: #1e40af;">
        <h4 style="margin: 0 0 5px 0; font-size: 14px;">Detalle del Producto:</h4>
        <p style="margin: 0; font-size: 14px;">
          <strong>${product?.title}</strong><br/>
          Valor: ${formattedTotal}
        </p>
      </div>

      <p style="font-size: 14px; line-height: 1.5; color: #475569;">
        El comprador se pondrá en contacto contigo para coordinar el pago directo (mediante tus métodos configurados) y la entrega. También puedes contactar al comprador usando sus datos de contacto provistos arriba (teléfono / correo).
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Este es un correo automático enviado por Woundu Marketplace. Por favor, no respondas a este mensaje.
      </p>
    </div>
  `;

  // 3. Despachar los correos electrónicos utilizando Brevo
  const emailPromises: Promise<any>[] = [];

  // Enviar correo al comprador
  if (buyer.email) {
    emailPromises.push(
      sendTransactionalEmail({
        to: [{ email: buyer.email, name: buyer.full_name }],
        subject: `¡Solicitud de compra creada! Pedido #${orderIdShort} - Woundu`,
        htmlContent: buyerMailHtml,
      })
    );
  }

  // Enviar correo al vendedor
  if (seller.email) {
    emailPromises.push(
      sendTransactionalEmail({
        to: [{ email: seller.email, name: seller.full_name }],
        subject: `¡Nuevo interesado en tu publicación! Pedido #${orderIdShort} - Woundu`,
        htmlContent: sellerMailHtml,
      })
    );
  }

  try {
    const results = await Promise.all(emailPromises);
    const hasError = results.some((res) => !res.success);
    
    if (hasError) {
      const errorMsg = results.find((res) => !res.success)?.error || "Error indeterminado";
      console.warn("Hubo un error enviando alguno de los correos:", errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Fallo general enviando correos de pedido:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado" };
  }
}
