import type { SupportTicketMessage } from "@/types/support";
import { formatSupportDate } from "@/lib/support/labels";
import { cn } from "@/lib/utils";

type SupportTicketMessageListProps = Readonly<{
  messages: ReadonlyArray<SupportTicketMessage>;
}>;

export function SupportTicketMessageList({
  messages,
}: SupportTicketMessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
        Aún no hay mensajes en este ticket.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <article
          className={cn(
            "rounded-2xl border px-4 py-3 shadow-sm",
            message.isStaffReply
              ? "border-brand/20 bg-brand-light/70"
              : "border-slate-200 bg-white",
          )}
          key={message.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-950">
              {message.authorName}
              {message.isStaffReply ? (
                <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Soporte
                </span>
              ) : null}
            </p>
            <time
              className="text-xs text-slate-500"
              dateTime={message.createdAt}
            >
              {formatSupportDate(message.createdAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {message.body}
          </p>
        </article>
      ))}
    </div>
  );
}
