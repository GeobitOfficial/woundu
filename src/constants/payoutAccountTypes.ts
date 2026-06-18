export const PAYOUT_ACCOUNT_TYPES = [
  { value: "savings", label: "Cuenta de ahorros" },
  { value: "checking", label: "Cuenta corriente" },
  { value: "digital_wallet", label: "Billetera digital" },
] as const;

export type PayoutAccountType = (typeof PAYOUT_ACCOUNT_TYPES)[number]["value"];

const LABELS: Record<PayoutAccountType, string> = {
  savings: "Cuenta de ahorros",
  checking: "Cuenta corriente",
  digital_wallet: "Billetera digital",
};

export function getPayoutAccountTypeLabel(type: PayoutAccountType): string {
  return LABELS[type];
}

export function getPayoutEntityLabel(type: PayoutAccountType): string {
  return type === "digital_wallet"
    ? "Billetera o plataforma"
    : "Entidad bancaria";
}
