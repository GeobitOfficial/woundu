"use client";

import { useMemo, useState } from "react";

import {
  ADMIN_AUDIT_ACTION_LABELS,
  type AdminAuditAction,
} from "@/lib/admin/auditActions";
import { formatAdminDate } from "@/lib/admin/labels";
import type { AdminAuditLogRecord } from "@/features/admin/types";
import { Input } from "@/components/ui";

type AuditLogManagementProps = Readonly<{
  initialLogs: AdminAuditLogRecord[];
}>;

export function AuditLogManagement({ initialLogs }: AuditLogManagementProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"all" | string>("all");

  const actionOptions = useMemo(() => {
    const unique = new Set(initialLogs.map((log) => log.action));
    return Array.from(unique).sort();
  }, [initialLogs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialLogs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        log.summary,
        log.actorName,
        log.entityType,
        log.entityId,
        log.action,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [actionFilter, initialLogs, search]);

  return (
    <div className="space-y-6">
      <Input
        label="Buscar en auditoría"
        name="search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Resumen, actor, entidad o acción"
        value={search}
      />

      <section className="flex flex-wrap gap-2">
        <FilterChip
          active={actionFilter === "all"}
          label="Todas las acciones"
          onClick={() => setActionFilter("all")}
        />
        {actionOptions.map((action) => (
          <FilterChip
            active={actionFilter === action}
            key={action}
            label={getActionLabel(action)}
            onClick={() => setActionFilter(action)}
          />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">
            Registro de acciones ({filteredLogs.length})
          </h2>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-600">
            {initialLogs.length === 0
              ? "Aún no hay acciones registradas."
              : "No hay entradas que coincidan con los filtros."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <li className="px-5 py-4" key={log.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{log.summary}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {log.actorName} · {getActionLabel(log.action)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {log.entityType} · {log.entityId.slice(0, 12)}… ·{" "}
                      {formatAdminDate(log.createdAt)}
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-600">
                    {log.action}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function getActionLabel(action: string): string {
  if (action in ADMIN_AUDIT_ACTION_LABELS) {
    return ADMIN_AUDIT_ACTION_LABELS[action as AdminAuditAction];
  }

  return action;
}

function FilterChip({
  active,
  label,
  onClick,
}: Readonly<{
  active: boolean;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-brand text-slate-950"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
