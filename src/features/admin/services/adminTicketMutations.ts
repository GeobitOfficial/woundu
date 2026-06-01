import type { AdminSupportTicketRecord } from "@/types/support";
import type {
  AdminSupportTicketReplyValues,
  AdminSupportTicketStatusValues,
} from "@/validations/support";
import { getCurrentUser, supabase } from "@/services/supabase/client";
import type { SupportTicketDetail } from "@/types/support";

import {
  mapAdminSupportTicket,
  mapSupportTicketDetail,
  SUPPORT_MESSAGE_SELECT,
  SUPPORT_TICKET_SELECT,
  type MessageRow,
  type TicketRow,
} from "@/features/support/services/supportTicketMapper";

type MutationResult<T> = Readonly<{
  data: T | null;
  error: string | null;
}>;

async function ensureSuperAdminSession() {
  const { data, error } = await getCurrentUser();
  if (error || !data.user) {
    return { ok: false as const, error: "Debes iniciar sesión como Super Admin." };
  }

  return { ok: true as const, userId: data.user.id };
}

async function fetchAdminTicketDetail(
  ticketId: string,
): Promise<SupportTicketDetail | null> {
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

async function fetchAdminTicketSummary(
  ticketId: string,
): Promise<AdminSupportTicketRecord | null> {
  const { data: ticketRow, error: ticketError } = await supabase
    .from("support_tickets")
    .select(SUPPORT_TICKET_SELECT)
    .eq("id", ticketId)
    .maybeSingle();

  if (ticketError || !ticketRow) {
    return null;
  }

  const { count, error: countError } = await supabase
    .from("support_ticket_messages")
    .select("id", { count: "exact", head: true })
    .eq("ticket_id", ticketId);

  if (countError) {
    return null;
  }

  return mapAdminSupportTicket(ticketRow as TicketRow, count ?? 0);
}

export async function loadSupportTicketDetailAsAdmin(
  ticketId: string,
): Promise<MutationResult<SupportTicketDetail>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const detail = await fetchAdminTicketDetail(ticketId);
  if (!detail) {
    return { data: null, error: "No pudimos cargar el ticket." };
  }

  return { data: detail, error: null };
}

export async function updateSupportTicketStatusAsAdmin(
  ticketId: string,
  values: AdminSupportTicketStatusValues,
): Promise<MutationResult<AdminSupportTicketRecord>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { error } = await supabase
    .from("support_tickets")
    .update({
      status: values.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (error) {
    return {
      data: null,
      error: getAdminTicketMutationError(error.message, "estado del ticket"),
    };
  }

  const summary = await fetchAdminTicketSummary(ticketId);
  if (!summary) {
    return { data: null, error: "Estado actualizado, pero no pudimos recargar el ticket." };
  }

  return { data: summary, error: null };
}

export async function replyToSupportTicketAsAdmin(
  ticketId: string,
  values: AdminSupportTicketReplyValues,
): Promise<MutationResult<SupportTicketDetail>> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { error: messageError } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticketId,
      author_id: session.userId,
      body: values.message.trim(),
      is_staff_reply: true,
    });

  if (messageError) {
    return {
      data: null,
      error: getAdminTicketMutationError(messageError.message, "respuesta"),
    };
  }

  const { error: statusError } = await supabase
    .from("support_tickets")
    .update({
      status: "waiting_user",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (statusError) {
    return {
      data: null,
      error: getAdminTicketMutationError(statusError.message, "ticket"),
    };
  }

  const detail = await fetchAdminTicketDetail(ticketId);
  if (!detail) {
    return { data: null, error: "Respuesta enviada, pero no pudimos recargar el ticket." };
  }

  return { data: detail, error: null };
}

function getAdminTicketMutationError(message: string | undefined, entity: string) {
  if (!message) {
    return `No pudimos actualizar la ${entity}. Inténtalo de nuevo.`;
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "No tienes permisos de Super Admin para esta acción.";
  }

  return `No pudimos actualizar la ${entity}. Revisa los datos e inténtalo de nuevo.`;
}
