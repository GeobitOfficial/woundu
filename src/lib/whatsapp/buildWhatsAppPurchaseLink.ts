const WHATSAPP_PURCHASE_MESSAGE =
  "Hola, me interesa comprar el producto \"{title}\" en Woundu ({url}). ¿Podemos coordinar el envío y el pago?";

export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw?.trim()) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");

  if (digits.length < 8 || digits.length > 15) {
    return null;
  }

  return digits;
}

export function buildWhatsAppPurchaseLink(
  whatsappNumber: string | null | undefined,
  productTitle: string,
  productUrl: string,
): string | null {
  const normalized = normalizeWhatsAppNumber(whatsappNumber);

  if (!normalized) {
    return null;
  }

  const message = WHATSAPP_PURCHASE_MESSAGE.replace("{title}", productTitle).replace(
    "{url}",
    productUrl,
  );

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
