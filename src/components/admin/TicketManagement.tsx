"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ZodError } from "zod";

import { SupportTicketStatusBadge } from "@/components/admin/AdminStatusBadge";
import { SupportTicketMessageList } from "@/components/support/SupportTicketMessageList";
import { Button } from "@/components/ui";
import {
  loadSupportTicketDetailAsAdmin,
  replyToSupportTicketAsAdmin,
  updateSupportTicketStatusAsAdmin,
} from "@/features/admin/services/adminTicketMutations";
import type { AdminSupportTicketRecord, SupportTicketDetail } from "@/types/support";
import {
  formatSupportDate,
  SUPPORT_TICKET_STATUS_LABELS,
  SUPPORT_TICKET_STATUS_OPTIONS,
} from "@/lib/support/labels";
import {
  adminSupportTicketReplySchema,
  adminSupportTicketStatusSchema,
  type AdminSupportTicketReplyValues,
  type AdminSupportTicketStatusValues,
} from "@/validations/support";

type TicketManagementProps = Readonly<{
  initialTickets: AdminSupportTicketRecord[];
}>;

export function TicketManagement({ initialTickets }: TicketManagementProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SupportTicketDetail | null>(
    null,
  );
  const [statusValues, setStatusValues] = useState<AdminSupportTicketStatusValues | null>(
    null,
  );
  const [replyValues, setReplyValues] = useState<AdminSupportTicketReplyValues>({
    message: "",
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const metrics = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter(
        (ticket) =>
          ticket.status === "open" ||
          ticket.status === "in_progress" ||
          ticket.status === "waiting_user",
      ).length,
      resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    }),
    [tickets],
  );

  async function openTicket(ticket: AdminSupportTicketRecord) {
    setSelectedId(ticket.id);
    setStatusValues({ status: ticket.status });
    setReplyValues({ message: "" });
    setStatusMessage(null);
    setIsSaving(true);

    const result = await loadSupportTicketDetailAsAdmin(ticket.id);
    setIsSaving(false);

    if (result.error || !result.data) {
      setStatusMessage(result.error ?? "No pudimos cargar el ticket.");
      setSelectedDetail(null);
      return;
    }

    setSelectedDetail(result.data);
  }

  async function handleStatusSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !statusValues) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const parsed = adminSupportTicketStatusSchema.parse(statusValues);
      const result = await updateSupportTicketStatusAsAdmin(selectedId, parsed);

      if (result.error || !result.data) {
        setStatusMessage(result.error ?? "No pudimos actualizar el estado.");
        return;
      }

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === result.data?.id ? result.data : ticket,
        ),
      );

      const detailResult = await loadSupportTicketDetailAsAdmin(selectedId);
      if (detailResult.data) {
        setSelectedDetail(detailResult.data);
        setStatusValues({ status: detailResult.data.status });
      }

      setStatusMessage("Estado actualizado correctamente.");
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setStatusMessage(error.issues[0]?.message ?? "Estado inválido.");
        return;
      }

      setStatusMessage("No pudimos actualizar el estado.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReplySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const parsed = adminSupportTicketReplySchema.parse(replyValues);
      const result = await replyToSupportTicketAsAdmin(selectedId, parsed);

      if (result.error || !result.data) {
        setStatusMessage(result.error ?? "No pudimos enviar la respuesta.");
        return;
      }

      setSelectedDetail(result.data);
      setStatusValues({ status: result.data.status });
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === result.data?.id
            ? {
                ...ticket,
                status: result.data.status,
                lastMessageAt: result.data.lastMessageAt,
                messageCount: result.data.messages.length,
              }
            : ticket,
        ),
      );
      setReplyValues({ message: "" });
      setStatusMessage("Respuesta enviada al usuario.");
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setStatusMessage(error.issues[0]?.message ?? "Mensaje inválido.");
        return;
      }

      setStatusMessage("No pudimos enviar la respuesta.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Tickets totales" value={String(metrics.total)} />
        <MetricCard label="Abiertos / en curso" value={String(metrics.open)} />
        <MetricCard label="Resueltos" value={String(metrics.resolved)} />
      </section>

      {tickets.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-600">
          Aún no hay tickets de soporte enviados por los usuarios.
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-950">Bandeja de soporte</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    className={`flex w-full flex-col gap-2 px-4 py-4 text-left transition ${
                      selectedId === ticket.id ? "bg-brand-light/60" : "hover:bg-slate-50"
                    }`}
                    onClick={() => void openTicket(ticket)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-950">{ticket.subject}</p>
                      <SupportTicketStatusBadge status={ticket.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {ticket.userName}
                      {ticket.userEmail ? ` · ${ticket.userEmail}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatSupportDate(ticket.lastMessageAt)} · {ticket.messageCount}{" "}
                      mensaje{ticket.messageCount === 1 ? "" : "s"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {!selectedDetail ? (
              <p className="py-16 text-center text-sm text-slate-500">
                Selecciona un ticket para ver la conversación y responder.
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                    Ticket #{selectedDetail.id.slice(0, 8)}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">
                    {selectedDetail.subject}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedDetail.userName}
                    {selectedDetail.userEmail
                      ? ` · ${selectedDetail.userEmail}`
                      : ""}
                  </p>
                </div>

                <SupportTicketMessageList messages={selectedDetail.messages} />

                <form className="space-y-3 border-t border-slate-100 pt-4" onSubmit={handleStatusSubmit}>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-800">
                      Estado del ticket
                    </span>
                    <select
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                      onChange={(event) =>
                        setStatusValues({
                          status: event.target
                            .value as AdminSupportTicketStatusValues["status"],
                        })
                      }
                      value={statusValues?.status ?? selectedDetail.status}
                    >
                      {SUPPORT_TICKET_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {SUPPORT_TICKET_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button disabled={isSaving} type="submit" variant="secondary">
                    {isSaving ? "Guardando..." : "Actualizar estado"}
                  </Button>
                </form>

                <form className="space-y-3 border-t border-slate-100 pt-4" onSubmit={handleReplySubmit}>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-800">
                      Respuesta de soporte
                    </span>
                    <textarea
                      className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15"
                      onChange={(event) =>
                        setReplyValues({ message: event.target.value })
                      }
                      placeholder="Escribe la respuesta para el usuario."
                      value={replyValues.message}
                    />
                  </label>
                  <Button disabled={isSaving} type="submit">
                    {isSaving ? "Enviando..." : "Enviar respuesta"}
                  </Button>
                </form>

                {statusMessage ? (
                  <p className="rounded-2xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
                    {statusMessage}
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
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
