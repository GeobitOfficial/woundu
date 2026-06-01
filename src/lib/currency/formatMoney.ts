const CURRENCY_LOCALE: Readonly<Record<string, string>> = {
  ARS: "es-AR",
  BOB: "es-BO",
  BRL: "pt-BR",
  CLP: "es-CL",
  COP: "es-CO",
  CRC: "es-CR",
  DOP: "es-DO",
  GTQ: "es-GT",
  HNL: "es-HN",
  MXN: "es-MX",
  NIO: "es-NI",
  PEN: "es-PE",
  PYG: "es-PY",
  UYU: "es-UY",
  VES: "es-VE",
  USD: "es-US",
};

export function formatMoney(amount: number, currency: string): string {
  const locale = CURRENCY_LOCALE[currency] ?? "es";
  const fractionDigits = currency === "USD" || currency.endsWith("D") ? 2 : 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(amount);
}
