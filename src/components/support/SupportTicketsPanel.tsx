"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LifeBuoy, Plus } from "lucide-react";
import { ZodError } from "zod";

import { SupportTicketMessageList } from "@/components/support/SupportTicketMessageList";
import { Button, Input } from "@/components/ui";
import {
  createSupportTicket,
  loadUserSupportTicketDetail,
  replyToSupportTicketAsUser,
} from "@/features/support/services/supportTicketMutations";
import type { SupportTicketDetail, UserSupportTicketSummary } from "@/types/support";
import {
  canUserReplyToTicket,
  formatSupportDate,
  SUPPORT_TICKET_STATUS_LABELS,
  SUPPORT_TICKET_STATUS_STYLES,
} from "@/lib/support/labels";
import {
  createSupportTicketSchema,
  supportTicketReplySchema,
  type CreateSupportTicketValues,
  type SupportTicketReplyValues,
} from "@/validations/support";

type SupportTicketsPanelProps = Readonly<{
  initialTickets: UserSupportTicketSummary[];
}>;

export function SupportTicketsPanel({ initialTickets }: SupportTicketsPanelProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [mode, setMode] = useState<"list" | "create" | "detail">("list");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDetail | null>(
    null,
  );
  const [createValues, setCreateValues] = useState<CreateSupportTicketValues>({
    subject: "",
    message: "",
  });
  const [replyValues, setReplyValues] = useState<SupportTicketReplyValues>({
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status === "open" ||
          ticket.status === "in_progress" ||
          ticket.status === "waiting_user",
      ).length,
    [tickets],
  );

  function resetMessages() {
    setStatusMessage(null);
    setErrors({});
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setIsSaving(true);

    try {
      const parsed = createSupportTicketSchema.parse(createValues);
      const result = await createSupportTicket(parsed);

      if (result.error || !result.data) {
        setStatusMessage(result.error ?? "No pudimos crear el ticket.");
        return;
      }

      const createdTicket = result.data;
      setTickets((current) => [
        {
          id: createdTicket.id,
          subject: createdTicket.subject,
          status: createdTicket.status,
          createdAt: createdTicket.createdAt,
          lastMessageAt: createdTicket.lastMessageAt,
          messageCount: createdTicket.messages.length,
        },
        ...current,
      ]);
      setSelectedTicket(createdTicket);
      setCreateValues({ subject: "", message: "" });
      setMode("detail");
      setStatusMessage("Ticket enviado a soporte correctamente.");
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(
          Object.fromEntries(
            error.issues.map((issue) => [String(issue.path[0]), issue.message]),
          ),
        );
        return;
      }

      setStatusMessage("No pudimos crear el ticket.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTicket) {
      return;
    }

    resetMessages();
    setIsSaving(true);

    try {
      const parsed = supportTicketReplySchema.parse(replyValues);
      const result = await replyToSupportTicketAsUser(selectedTicket.id, parsed);

      if (result.error || !result.data) {
        setStatusMessage(result.error ?? "No pudimos enviar tu respuesta.");
        return;
      }

      const updatedTicket = result.data;
      setSelectedTicket(updatedTicket);
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === updatedTicket.id
            ? {
                ...ticket,
                status: updatedTicket.status,
                lastMessageAt: updatedTicket.lastMessageAt,
                messageCount: updatedTicket.messages.length,
              }
            : ticket,
        ),
      );
      setReplyValues({ message: "" });
      setStatusMessage("Respuesta enviada.");
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setStatusMessage(error.issues[0]?.message ?? "Mensaje inválido.");
        return;
      }

      setStatusMessage("No pudimos enviar tu respuesta.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Tickets totales" value={String(tickets.length)} />
        <MetricCard label="Abiertos" value={String(openTickets)} />
        <MetricCard
          label="Estado"
          value={openTickets > 0 ? "En seguimiento" : "Sin pendientes"}
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setMode("list");
            setSelectedTicket(null);
            resetMessages();
          }}
          type="button"
          variant={mode === "list" ? "primary" : "secondary"}
        >
          Mis tickets
        </Button>
        <Button
          onClick={() => {
            setMode("create");
            setSelectedTicket(null);
            resetMessages();
          }}
          type="button"
          variant={mode === "create" ? "primary" : "secondary"}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Nuevo ticket
        </Button>
      </div>

      {mode === "create" ? (
        <section className="rounded-[2rem] border border-brand/25 bg-white/95 p-6 shadow-lg shadow-brand/10">
          <h2 className="text-lg font-black text-slate-950">Crear ticket de soporte</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cuéntanos tu consulta. El equipo Super Admin de Woundu recibirá tu
            mensaje y podrá responderte desde el panel de soporte.
          </p>

          <form className="mt-6 space-y-4" noValidate onSubmit={handleCreate}>
            <Input
              error={errors.subject}
              label="Asunto"
              name="subject"
              onChange={(event) =>
                setCreateValues((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
              placeholder="Ej. Problema al publicar un producto"
              value={createValues.subject}
            />
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-800">Mensaje</span>
              <textarea
                className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15"
                name="message"
                onChange={(event) =>
                  setCreateValues((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Describe tu problema con el mayor detalle posible."
                value={createValues.message}
              />
              {errors.message ? (
                <p className="text-xs leading-5 text-red-600">{errors.message}</p>
              ) : null}
            </label>

            {statusMessage ? (
              <p className="rounded-2xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
                {statusMessage}
              </p>
            ) : null}

            <Button disabled={isSaving} type="submit">
              {isSaving ? "Enviando..." : "Enviar ticket"}
            </Button>
          </form>
        </section>
      ) : null}

      {mode === "list" ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {tickets.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted text-brand-dark">
                <LifeBuoy aria-hidden="true" className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950">
                Aún no tienes tickets de soporte
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Crea tu primer ticket si necesitas ayuda con publicaciones, cuenta o
                cualquier aspecto de Woundu.
              </p>
              <Button
                className="mt-5"
                onClick={() => setMode("create")}
                type="button"
              >
                Crear ticket
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    className="flex w-full flex-col gap-2 px-1 py-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    onClick={async () => {
                      resetMessages();
                      setIsSaving(true);
                      const result = await loadUserSupportTicketDetail(ticket.id);
                      setIsSaving(false);

                      if (result.error || !result.data) {
                        setStatusMessage(result.error ?? "No pudimos cargar el ticket.");
                        return;
                      }

                      setSelectedTicket(result.data);
                      setMode("detail");
                    }}
                    type="button"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{ticket.subject}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatSupportDate(ticket.lastMessageAt)} ·{" "}
                        {ticket.messageCount} mensaje
                        {ticket.messageCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${SUPPORT_TICKET_STATUS_STYLES[ticket.status]}`}
                    >
                      {SUPPORT_TICKET_STATUS_LABELS[ticket.status]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {mode === "detail" && selectedTicket ? (
        <TicketDetailSection
          isSaving={isSaving}
          onReply={handleReply}
          replyValues={replyValues}
          selectedTicket={selectedTicket}
          setReplyValues={setReplyValues}
          statusMessage={statusMessage}
        />
      ) : null}

      <p className="text-sm text-slate-600">
        También puedes volver a{" "}
        <Link className="font-semibold text-brand hover:underline" href="/cuenta">
          tu cuenta
        </Link>
        .
      </p>
    </div>
  );
}

function TicketDetailSection({
  isSaving,
  onReply,
  replyValues,
  selectedTicket,
  setReplyValues,
  statusMessage,
}: Readonly<{
  isSaving: boolean;
  onReply: (event: React.FormEvent<HTMLFormElement>) => void;
  replyValues: SupportTicketReplyValues;
  selectedTicket: SupportTicketDetail;
  setReplyValues: React.Dispatch<React.SetStateAction<SupportTicketReplyValues>>;
  statusMessage: string | null;
}>) {
  const canReply = canUserReplyToTicket(selectedTicket.status);

  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Ticket #{selectedTicket.id.slice(0, 8)}
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {selectedTicket.subject}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Creado {formatSupportDate(selectedTicket.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${SUPPORT_TICKET_STATUS_STYLES[selectedTicket.status]}`}
        >
          {SUPPORT_TICKET_STATUS_LABELS[selectedTicket.status]}
        </span>
      </div>

      <SupportTicketMessageList messages={selectedTicket.messages} />

      {canReply ? (
        <form className="space-y-3 border-t border-slate-100 pt-4" noValidate onSubmit={onReply}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">Tu respuesta</span>
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15"
              onChange={(event) =>
                setReplyValues({ message: event.target.value })
              }
              placeholder="Escribe información adicional para soporte."
              value={replyValues.message}
            />
          </label>
          {statusMessage ? (
            <p className="rounded-2xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
              {statusMessage}
            </p>
          ) : null}
          <Button disabled={isSaving} type="submit" variant="primary">
            {isSaving ? "Enviando..." : "Enviar respuesta"}
          </Button>
        </form>
      ) : (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Este ticket está {SUPPORT_TICKET_STATUS_LABELS[selectedTicket.status].toLowerCase()}.
          Si necesitas ayuda adicional, crea un nuevo ticket.
        </p>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}
