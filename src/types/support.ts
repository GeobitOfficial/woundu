export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "waiting_user"
  | "resolved"
  | "closed";

export type SupportTicketMessage = Readonly<{
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  body: string;
  isStaffReply: boolean;
  createdAt: string;
}>;

export type SupportTicketSummary = Readonly<{
  id: string;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
}>;

export type SupportTicketDetail = Readonly<{
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  lastMessageAt: string;
  messages: ReadonlyArray<SupportTicketMessage>;
}>;

export type UserSupportTicketSummary = Readonly<{
  id: string;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}>;

export type AdminSupportTicketRecord = Readonly<{
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
}>;
