import type {
  AdminSupportTicketRecord,
  SupportTicketDetail,
  SupportTicketMessage,
  SupportTicketStatus,
  UserSupportTicketSummary,
} from "@/types/support";

export const SUPPORT_TICKET_SELECT = `
  id,
  user_id,
  subject,
  status,
  created_at,
  updated_at,
  resolved_at,
  closed_at,
  last_message_at,
  profiles!support_tickets_user_id_fkey (
    full_name,
    email
  )
`;

export const SUPPORT_MESSAGE_SELECT = `
  id,
  ticket_id,
  author_id,
  body,
  is_staff_reply,
  created_at,
  profiles!support_ticket_messages_author_id_fkey (
    full_name
  )
`;

type ProfileRelation = { full_name: string; email?: string | null } | null;

type TicketRow = {
  id: string;
  user_id: string;
  subject: string;
  status: SupportTicketStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  last_message_at: string;
  profiles: ProfileRelation | ProfileRelation[];
};

type MessageRow = {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  is_staff_reply: boolean;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export function mapSupportMessage(row: MessageRow): SupportTicketMessage {
  const author = firstRelation(row.profiles);

  return {
    id: row.id,
    ticketId: row.ticket_id,
    authorId: row.author_id,
    authorName: author?.full_name ?? "Usuario",
    body: row.body,
    isStaffReply: row.is_staff_reply,
    createdAt: row.created_at,
  };
}

export function mapUserSupportTicketSummary(
  row: TicketRow,
  messageCount: number,
): UserSupportTicketSummary {
  return {
    id: row.id,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
    lastMessageAt: row.last_message_at,
    messageCount,
  };
}

export function mapAdminSupportTicket(
  row: TicketRow,
  messageCount: number,
): AdminSupportTicketRecord {
  const user = firstRelation(row.profiles);

  return {
    id: row.id,
    userId: row.user_id,
    userName: user?.full_name ?? "Usuario",
    userEmail: user?.email ?? null,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastMessageAt: row.last_message_at,
    messageCount,
  };
}

export function mapSupportTicketDetail(
  row: TicketRow,
  messages: ReadonlyArray<MessageRow>,
): SupportTicketDetail {
  const user = firstRelation(row.profiles);

  return {
    id: row.id,
    userId: row.user_id,
    userName: user?.full_name ?? "Usuario",
    userEmail: user?.email ?? null,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    closedAt: row.closed_at,
    lastMessageAt: row.last_message_at,
    messages: messages.map(mapSupportMessage),
  };
}

export type { MessageRow, TicketRow };
