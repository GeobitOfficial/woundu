import { getCurrentUser, supabase } from "@/services/supabase/client";
import type { SupportTicketDetail } from "@/types/support";
import type {
  CreateSupportTicketValues,
  SupportTicketReplyValues,
} from "@/validations/support";

import {
  mapSupportTicketDetail,
  SUPPORT_MESSAGE_SELECT,
  SUPPORT_TICKET_SELECT,
  type MessageRow,
  type TicketRow,
} from "./supportTicketMapper";

type MutationResult<T> = Readonly<{
  data: T | null;
  error: string | null;
}>;

async function ensureAuthenticatedUser() {
  const { data, error } = await getCurrentUser();

  if (error || !data.user) {
    return { ok: false as const, error: "Debes iniciar sesión para continuar." };
  }

  return { ok: true as const, userId: data.user.id };
}

async function fetchTicketDetail(
  ticketId: string,
  userId: string,
): Promise<SupportTicketDetail | null> {
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

export async function loadUserSupportTicketDetail(
  ticketId: string,
): Promise<MutationResult<SupportTicketDetail>> {
  const session = await ensureAuthenticatedUser();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const detail = await fetchTicketDetail(ticketId, session.userId);
  if (!detail) {
    return { data: null, error: "No pudimos cargar el ticket." };
  }

  return { data: detail, error: null };
}

export async function createSupportTicket(
  values: CreateSupportTicketValues,
): Promise<MutationResult<SupportTicketDetail>> {
  const session = await ensureAuthenticatedUser();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data: ticketRow, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: session.userId,
      subject: values.subject.trim(),
      status: "open",
    })
    .select("id")
    .single();

  if (ticketError || !ticketRow) {
    return {
      data: null,
      error: ticketError?.message ?? "No pudimos crear el ticket.",
    };
  }

  const ticketId = String(ticketRow.id);
  const { error: messageError } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticketId,
      author_id: session.userId,
      body: values.message.trim(),
      is_staff_reply: false,
    });

  if (messageError) {
    return {
      data: null,
      error: messageError.message ?? "No pudimos registrar tu mensaje.",
    };
  }

  const detail = await fetchTicketDetail(ticketId, session.userId);
  if (!detail) {
    return {
      data: null,
      error: "Ticket creado, pero no pudimos cargar el detalle.",
    };
  }

  return { data: detail, error: null };
}

export async function replyToSupportTicketAsUser(
  ticketId: string,
  values: SupportTicketReplyValues,
): Promise<MutationResult<SupportTicketDetail>> {
  const session = await ensureAuthenticatedUser();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { error } = await supabase.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    author_id: session.userId,
    body: values.message.trim(),
    is_staff_reply: false,
  });

  if (error) {
    return {
      data: null,
      error: error.message ?? "No pudimos enviar tu respuesta.",
    };
  }

  const detail = await fetchTicketDetail(ticketId, session.userId);
  if (!detail) {
    return { data: null, error: "Respuesta enviada, pero no pudimos recargar el ticket." };
  }

  return { data: detail, error: null };
}
