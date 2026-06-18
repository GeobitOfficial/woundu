import type { OrderStatus } from "@/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  processing: "En proceso",
  completed: "Completado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-brand-muted text-brand-dark",
  paid: "bg-brand-muted text-brand-dark",
  processing: "bg-indigo-100 text-indigo-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-slate-200 text-slate-800",
  refunded: "bg-violet-100 text-violet-900",
};

export function formatAccountDate(iso: string): string {
  if (!iso) {
    return "—";
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function getBuyerOrderActionLabel(status: OrderStatus): string {
  if (status === "pending") {
    return "Completar pago";
  }

  if (status === "completed") {
    return "Ver detalle";
  }

  return "Seguir pedido";
}
