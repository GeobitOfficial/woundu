import type { ProductStatus } from "@/types";
import type { SupportTicketStatus } from "@/types/support";
import type { OrderDisputeStatus } from "@/features/admin/types";

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_STYLES,
} from "@/lib/admin/labels";
import {
  SUPPORT_TICKET_STATUS_LABELS,
  SUPPORT_TICKET_STATUS_STYLES,
} from "@/lib/support/labels";
import {
  ORDER_DISPUTE_STATUS_LABELS,
  ORDER_DISPUTE_STATUS_STYLES,
} from "@/lib/admin/disputeLabels";

export function ProductStatusBadge({
  status,
}: Readonly<{ status: ProductStatus }>) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${PRODUCT_STATUS_STYLES[status]}`}
    >
      {PRODUCT_STATUS_LABELS[status]}
    </span>
  );
}

export function OrderStatusBadge({
  status,
}: Readonly<{ status: keyof typeof ORDER_STATUS_LABELS }>) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${ORDER_STATUS_STYLES[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function SupportTicketStatusBadge({
  status,
}: Readonly<{ status: SupportTicketStatus }>) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${SUPPORT_TICKET_STATUS_STYLES[status]}`}
    >
      {SUPPORT_TICKET_STATUS_LABELS[status]}
    </span>
  );
}

export function DisputeStatusBadge({
  status,
}: Readonly<{ status: OrderDisputeStatus }>) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${ORDER_DISPUTE_STATUS_STYLES[status]}`}
    >
      {ORDER_DISPUTE_STATUS_LABELS[status]}
    </span>
  );
}
