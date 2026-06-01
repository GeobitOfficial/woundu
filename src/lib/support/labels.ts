import type { SupportTicketStatus } from "@/types/support";

export const SUPPORT_TICKET_STATUS_OPTIONS = [
  "open",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
] as const satisfies ReadonlyArray<SupportTicketStatus>;

export const SUPPORT_TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  waiting_user: "Esperando usuario",
  resolved: "Resuelto",
  closed: "Cerrado",
};

export const SUPPORT_TICKET_STATUS_STYLES: Record<SupportTicketStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  in_progress: "bg-indigo-100 text-indigo-900",
  waiting_user: "bg-sky-100 text-sky-900",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-800",
};

export function canUserReplyToTicket(status: SupportTicketStatus): boolean {
  return status === "open" || status === "in_progress" || status === "waiting_user";
}

export function formatSupportDate(iso: string): string {
  if (!iso) {
    return "—";
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
