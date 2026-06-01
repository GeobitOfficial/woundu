"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ZodError } from "zod";

import { OrderStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button, Input } from "@/components/ui";
import { updateOrderStatusAsAdmin } from "@/features/admin/services/adminMutations";
import type { AdminOrderRecord } from "@/features/admin/types";
import {
  formatAdminDate,
  formatAdminMoney,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
} from "@/lib/admin/labels";
import type { OrderStatus } from "@/types";
import {
  adminOrderStatusSchema,
  type AdminOrderStatusValues,
} from "@/validations/admin";

type OrderManagementProps = Readonly<{
  initialOrders: AdminOrderRecord[];
}>;

export function OrderManagement({ initialOrders }: OrderManagementProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<AdminOrderStatusValues | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const metrics = useMemo(
    () => ({
      total: orders.length,
      completed: orders.filter((order) => order.status === "completed").length,
      pending: orders.filter((order) => order.status === "pending").length,
    }),
    [orders],
  );

  const selectedOrder = orders.find((order) => order.id === selectedId) ?? null;

  function startEdit(order: AdminOrderRecord) {
    setSelectedId(order.id);
    setValues({
      status: order.status,
      paymentReference: order.paymentReference ?? "",
    });
    setStatusMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOrder || !values) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const parsed = adminOrderStatusSchema.parse(values);
      const result = await updateOrderStatusAsAdmin(selectedOrder.id, parsed);

      if (result.error || !result.data) {
        setStatusMessage(result.error ?? "No pudimos actualizar el pedido.");
        return;
      }

      setOrders((current) =>
        current.map((order) => (order.id === result.data?.id ? result.data : order)),
      );
      setStatusMessage("Estado del pedido actualizado correctamente.");
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setStatusMessage(error.issues[0]?.message ?? "Datos inválidos.");
        return;
      }

      setStatusMessage("No pudimos actualizar el pedido.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Operaciones totales" value={String(metrics.total)} />
        <MetricCard label="Completadas" value={String(metrics.completed)} />
        <MetricCard label="Pendientes" value={String(metrics.pending)} />
      </section>

      {orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-600">
          Aún no hay compras registradas en la plataforma.
        </section>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              isSelected={order.id === selectedId}
              key={order.id}
              onManage={() => startEdit(order)}
              order={order}
            />
          ))}
        </div>
      )}

      {selectedOrder && values ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-bold text-slate-950">
            Actualizar pedido {selectedOrder.id.slice(0, 8)}…
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Cambia el estado de la operación y, si aplica, registra una referencia
            de pago.
          </p>

          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-sm font-medium text-slate-800">Estado</span>
              <select
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) =>
                  setValues((current) =>
                    current
                      ? {
                          ...current,
                          status: event.target.value as OrderStatus,
                        }
                      : current,
                  )
                }
                value={values.status}
              >
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {ORDER_STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>

            <Input
              helperText="Opcional. Útil cuando marcas el pedido como pagado."
              label="Referencia de pago"
              name="paymentReference"
              onChange={(event) =>
                setValues((current) =>
                  current
                    ? { ...current, paymentReference: event.target.value }
                    : current,
                )
              }
              value={values.paymentReference ?? ""}
            />

            {statusMessage ? (
              <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark sm:col-span-2">
                {statusMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button disabled={isSaving} type="submit">
                {isSaving ? "Guardando..." : "Guardar estado"}
              </Button>
              <Button
                onClick={() => {
                  setSelectedId(null);
                  setValues(null);
                  setStatusMessage(null);
                }}
                type="button"
                variant="secondary"
              >
                Cerrar
              </Button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function OrderCard({
  isSelected,
  onManage,
  order,
}: Readonly<{
  isSelected: boolean;
  onManage: () => void;
  order: AdminOrderRecord;
}>) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isSelected ? "border-brand ring-2 ring-brand/20" : "border-slate-200"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-xs font-mono text-slate-500">
            Pedido {order.id.slice(0, 8)}…
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {formatAdminMoney(order.total, order.currency)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Button onClick={onManage} size="sm" type="button" variant="secondary">
            Gestionar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4 lg:grid-cols-2">
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Comprador:</span>{" "}
            {order.buyerName}
            {order.buyerEmail ? ` (${order.buyerEmail})` : ""}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Fecha:</span>{" "}
            {formatAdminDate(order.createdAt)}
          </p>
          {order.completedAt ? (
            <p>
              <span className="font-semibold text-slate-900">Completado:</span>{" "}
              {formatAdminDate(order.completedAt)}
            </p>
          ) : null}
          {order.cancelledAt ? (
            <p>
              <span className="font-semibold text-slate-900">Cancelado:</span>{" "}
              {formatAdminDate(order.cancelledAt)}
            </p>
          ) : null}
          {order.paymentReference ? (
            <p>
              <span className="font-semibold text-slate-900">Referencia pago:</span>{" "}
              {order.paymentReference}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {order.lines.map((line) => (
            <div
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              key={line.id}
            >
              <p className="font-semibold text-slate-950">{line.productTitle}</p>
              <p className="mt-1 text-slate-600">
                Vendedor: {line.sellerName}
                {line.sellerEmail ? ` (${line.sellerEmail})` : ""}
              </p>
              <p className="mt-1 text-slate-600">
                Lugar:{" "}
                {[line.productCity, line.productCountry].filter(Boolean).join(", ") ||
                  "Sin ubicación registrada"}
              </p>
              <p className="mt-2 font-medium text-slate-900">
                {formatAdminMoney(line.totalPrice, order.currency)} · x{line.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function MetricCard({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
