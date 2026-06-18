import type { SellerSalesTab } from "@/features/account/sellerSalesConstants";
import type { OrderStatus } from "@/types";

export const SELLER_PENDING_ORDER_STATUSES: ReadonlyArray<OrderStatus> = [
  "pending",
  "paid",
  "processing",
];

export const SELLER_FINALIZED_ORDER_STATUSES: ReadonlyArray<OrderStatus> = [
  "completed",
  "cancelled",
  "refunded",
];

export const SELLER_SALES_TAB_STATUSES: Record<
  SellerSalesTab,
  ReadonlyArray<OrderStatus>
> = {
  pendientes: SELLER_PENDING_ORDER_STATUSES,
  finalizadas: SELLER_FINALIZED_ORDER_STATUSES,
};

export function isSellerPendingOrderStatus(status: OrderStatus): boolean {
  return SELLER_PENDING_ORDER_STATUSES.includes(status);
}

export function isSellerFinalizedOrderStatus(status: OrderStatus): boolean {
  return SELLER_FINALIZED_ORDER_STATUSES.includes(status);
}

export function getSellerSaleActionLabel(status: OrderStatus): string {
  if (status === "paid") {
    return "Confirmar pago";
  }

  if (status === "processing") {
    return "Completar venta";
  }

  if (status === "pending") {
    return "Ver pedido";
  }

  return "Ver detalle";
}

export function parseSellerSalesTab(raw: string | undefined): SellerSalesTab {
  return raw === "finalizadas" ? "finalizadas" : "pendientes";
}
