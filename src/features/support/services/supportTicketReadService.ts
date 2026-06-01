import { createSupabaseServerClient } from "@/services/supabase/server";
import type {
  SupportTicketDetail,
  UserSupportTicketSummary,
} from "@/types/support";

import {
  mapSupportTicketDetail,
  mapUserSupportTicketSummary,
  SUPPORT_MESSAGE_SELECT,
  SUPPORT_TICKET_SELECT,
  type MessageRow,
  type TicketRow,
} from "./supportTicketMapper";

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

export async function getUserSupportTickets(
  userId: string,
): Promise<UserSupportTicketSummary[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select(SUPPORT_TICKET_SELECT)
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as TicketRow[];
  const counts = await countMessagesByTicketId(rows.map((row) => row.id));

  return rows.map((row) =>
    mapUserSupportTicketSummary(row, counts.get(row.id) ?? 0),
  );
}

export async function getUserSupportTicketDetail(
  userId: string,
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
    .eq("user_id", userId)
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
