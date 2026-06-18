import type { ProductStatus } from "@/types";

export const SELLER_PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  paused: "Pausado",
  sold: "Vendido",
  archived: "Archivado",
  pending_review: "En revision",
  rejected: "Rechazado",
};

export const SELLER_PRODUCT_STATUS_STYLE: Partial<Record<ProductStatus, string>> = {
  active: "bg-emerald-100 text-emerald-900",
  pending_review: "bg-amber-100 text-amber-900",
  rejected: "bg-red-100 text-red-900",
  paused: "bg-slate-200 text-slate-800",
  sold: "bg-violet-100 text-violet-900",
};
