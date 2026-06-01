import type { OrderStatus, ProductStatus, UserRole } from "@/types";

export const PRODUCT_MODERATION_STATUSES = [
  "pending_review",
  "active",
  "rejected",
] as const;

export type ProductModerationStatus = (typeof PRODUCT_MODERATION_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Borrador",
  pending_review: "Pendiente",
  active: "Disponible",
  rejected: "Rechazado",
  paused: "Pausado",
  sold: "Vendido",
  archived: "Archivado",
};

export const PRODUCT_STATUS_STYLES: Record<ProductStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_review: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  paused: "bg-indigo-100 text-indigo-800",
  sold: "bg-violet-100 text-violet-800",
  archived: "bg-slate-200 text-slate-800",
};

export const ORDER_STATUS_OPTIONS = [
  "pending",
  "paid",
  "processing",
  "completed",
  "cancelled",
  "refunded",
] as const satisfies ReadonlyArray<OrderStatus>;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  processing: "En proceso",
  completed: "Completado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-800",
  refunded: "bg-violet-100 text-violet-800",
};

export function formatAdminDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatAdminMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Administrador";
    case "seller":
      return "Vendedor";
    case "buyer":
      return "Comprador";
    default:
      return role;
  }
}
