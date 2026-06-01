import { createSupabaseServerClient } from "@/services/supabase/server";
import type { AdminSupportTicketRecord, SupportTicketDetail } from "@/types/support";

import {
  mapAdminSupportTicket,
  mapSupportTicketDetail,
  SUPPORT_MESSAGE_SELECT,
  SUPPORT_TICKET_SELECT,
  type MessageRow,
  type TicketRow,
} from "@/features/support/services/supportTicketMapper";

async function countMessagesByTicketId(
  ticketIds: ReadonlyArray<string>,
): Promise<ReadonlyMap<string, number>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || ticketIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("support_ticket_messages")
    .select("ticket_id")
    .in("ticket_id", [...ticketIds]);

  if (error || !data) {
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data as ReadonlyArray<{ ticket_id: string }>) {
    counts.set(row.ticket_id, (counts.get(row.ticket_id) ?? 0) + 1);
  }

  return counts;
}

export async function getAllSupportTicketsForAdmin(): Promise<
  AdminSupportTicketRecord[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select(SUPPORT_TICKET_SELECT)
    .order("last_message_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as TicketRow[];
  const counts = await countMessagesByTicketId(rows.map((row) => row.id));

  return rows.map((row) => mapAdminSupportTicket(row, counts.get(row.id) ?? 0));
}

export async function getSupportTicketDetailForAdmin(
  ticketId: string,
): Promise<SupportTicketDetail | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data: ticketRow, error: ticketError } = await supabase
    .from("support_tickets")
    .select(SUPPORT_TICKET_SELECT)
    .eq("id", ticketId)
    .maybeSingle();

  if (ticketError || !ticketRow) {
    return null;
  }

  const { data: messages, error: messagesError } = await supabase
    .from("support_ticket_messages")
    .select(SUPPORT_MESSAGE_SELECT)
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (messagesError || !messages) {
    return null;
  }

  return mapSupportTicketDetail(
    ticketRow as TicketRow,
    messages as MessageRow[],
  );
}

export async function getOpenSupportTicketCountForAdmin(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .in("status", ["open", "in_progress", "waiting_user"]);

  if (error || count == null) {
    return 0;
  }

  return count;
}
