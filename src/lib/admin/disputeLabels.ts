import type { OrderDisputeStatus } from "@/features/admin/types";

export const ORDER_DISPUTE_STATUS_OPTIONS = [
  "open",
  "under_review",
  "approved_refund",
  "rejected",
  "closed",
] as const satisfies ReadonlyArray<OrderDisputeStatus>;

export const ORDER_DISPUTE_STATUS_LABELS: Record<OrderDisputeStatus, string> = {
  open: "Abierta",
  under_review: "En revisión",
  approved_refund: "Reembolso aprobado",
  rejected: "Rechazada",
  closed: "Cerrada",
};

export const ORDER_DISPUTE_STATUS_STYLES: Record<OrderDisputeStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  approved_refund: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  closed: "bg-slate-200 text-slate-800",
};
