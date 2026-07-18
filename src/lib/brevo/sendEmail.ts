type EmailRecipient = {
  email: string;
  name?: string;
};

type SendEmailParams = {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
};

/**
 * Envía un correo electrónico transaccional utilizando la API v3 de Brevo.
 */
export async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
}: SendEmailParams): Promise<{ success: boolean; error: string | null }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Woundu Marketplace";

  if (!apiKey) {
    console.warn("BREVO_API_KEY no está configurada en las variables de entorno.");
    return { success: false, error: "API key missing" };
  }

  if (!senderEmail) {
    console.warn("BREVO_SENDER_EMAIL no está configurada en las variables de entorno.");
    return { success: false, error: "Sender email missing" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to,
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error de Brevo API:", errorData);
      return {
        success: false,
        error: errorData.message || `HTTP error ${response.status}`,
      };
    }

    const data = await response.json();
    console.log("Correo enviado con éxito mediante Brevo. Message ID:", data.messageId);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error enviando correo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
