"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ZodError } from "zod";

import { DisputeStatusBadge, OrderStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button, Input } from "@/components/ui";
import {
  confirmOrderPaymentAsAdmin,
  createOrderDisputeAsAdmin,
  processOrderRefundAsAdmin,
  resolveOrderDisputeAsAdmin,
} from "@/features/admin/services/adminPaymentMutations";
import type {
  AdminDisputeRecord,
  AdminOrderRecord,
  AdminPaymentWorkflow,
  OrderDisputeStatus,
} from "@/features/admin/types";
import {
  formatAdminDate,
  formatAdminMoney,
  ORDER_STATUS_LABELS,
} from "@/lib/admin/labels";
import {
  ORDER_DISPUTE_STATUS_LABELS,
  ORDER_DISPUTE_STATUS_OPTIONS,
} from "@/lib/admin/disputeLabels";
import {
  adminDisputeCreateSchema,
  adminDisputeResolveSchema,
  adminOrderPaymentSchema,
  adminOrderRefundSchema,
  type AdminDisputeCreateValues,
  type AdminDisputeResolveValues,
  type AdminOrderPaymentValues,
  type AdminOrderRefundValues,
} from "@/validations/admin";

type PaymentManagementProps = Readonly<{
  initialOrders: AdminOrderRecord[];
  initialDisputes: AdminDisputeRecord[];
}>;

const WORKFLOW_STEPS: ReadonlyArray<{
  id: AdminPaymentWorkflow;
  title: string;
  description: string;
}> = [
  {
    id: "confirm_payment",
    title: "Confirmar pago",
    description: "Marca un pedido como pagado y registra la referencia.",
  },
  {
    id: "manage_dispute",
    title: "Disputas",
    description: "Abre o resuelve disputas ligadas a pedidos.",
  },
  {
    id: "process_refund",
    title: "Reembolso guiado",
    description: "Procesa un reembolso parcial o total con motivo.",
  },
];

export function PaymentManagement({
  initialOrders,
  initialDisputes,
}: PaymentManagementProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [disputes, setDisputes] = useState(initialDisputes);
  const [workflow, setWorkflow] = useState<AdminPaymentWorkflow | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [paymentValues, setPaymentValues] = useState<AdminOrderPaymentValues>({
    paymentReference: "",
  });
  const [refundValues, setRefundValues] = useState<AdminOrderRefundValues>({
    refundAmount: 0,
    refundReason: "",
    paymentReference: "",
  });
  const [disputeCreateValues, setDisputeCreateValues] =
    useState<AdminDisputeCreateValues>({
      orderId: "",
      reason: "",
      buyerNote: "",
    });
  const [disputeResolveValues, setDisputeResolveValues] =
    useState<AdminDisputeResolveValues>({
      status: "under_review",
      adminNote: "",
      refundAmount: 0,
      processRefund: false,
    });
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const eligibleOrders = useMemo(() => {
    if (workflow === "confirm_payment") {
      return orders.filter((order) =>
        ["pending", "processing"].includes(order.status),
      );
    }

    if (workflow === "process_refund") {
      return orders.filter((order) =>
        ["paid", "processing", "completed"].includes(order.status),
      );
    }

    return orders;
  }, [orders, workflow]);

  const openDisputes = useMemo(
    () =>
      disputes.filter((dispute) =>
        ["open", "under_review"].includes(dispute.status),
      ),
    [disputes],
  );

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;
  const selectedDispute =
    disputes.find((dispute) => dispute.id === selectedDisputeId) ?? null;

  function resetForms() {
    setStatus(null);
    setPaymentValues({ paymentReference: "" });
    setRefundValues({ refundAmount: 0, refundReason: "", paymentReference: "" });
    setDisputeCreateValues({ orderId: "", reason: "", buyerNote: "" });
    setDisputeResolveValues({
      status: "under_review",
      adminNote: "",
      refundAmount: 0,
      processRefund: false,
    });
  }

  function selectWorkflow(next: AdminPaymentWorkflow) {
    setWorkflow(next);
    setSelectedOrderId(null);
    setSelectedDisputeId(null);
    resetForms();
  }

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOrder) return;

    setIsSaving(true);
    setStatus(null);

    try {
      const parsed = adminOrderPaymentSchema.parse(paymentValues);
      const result = await confirmOrderPaymentAsAdmin(selectedOrder.id, parsed);
      if (result.error || !result.data) {
        setStatus(result.error ?? "No pudimos confirmar el pago.");
        return;
      }
      setOrders((current) =>
        current.map((order) => (order.id === result.data?.id ? result.data : order)),
      );
      setStatus("Pago confirmado correctamente.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof ZodError ? error.issues[0]?.message : "Error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitRefund(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOrder) return;

    setIsSaving(true);
    setStatus(null);

    try {
      const parsed = adminOrderRefundSchema.parse({
        ...refundValues,
        refundAmount:
          refundValues.refundAmount > 0
            ? refundValues.refundAmount
            : selectedOrder.total,
      });
      const result = await processOrderRefundAsAdmin(selectedOrder.id, parsed);
      if (result.error || !result.data) {
        setStatus(result.error ?? "No pudimos procesar el reembolso.");
        return;
      }
      setOrders((current) =>
        current.map((order) => (order.id === result.data?.id ? result.data : order)),
      );
      setStatus("Reembolso registrado correctamente.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof ZodError ? error.issues[0]?.message : "Error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitDisputeCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOrder) return;

    setIsSaving(true);
    setStatus(null);

    try {
      const parsed = adminDisputeCreateSchema.parse({
        ...disputeCreateValues,
        orderId: selectedOrder.id,
      });
      const result = await createOrderDisputeAsAdmin(parsed);
      if (result.error || !result.data) {
        setStatus(result.error ?? "No pudimos crear la disputa.");
        return;
      }
      setDisputes((current) => [result.data!, ...current]);
      setStatus("Disputa registrada.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof ZodError ? error.issues[0]?.message : "Error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitDisputeResolve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDispute) return;

    setIsSaving(true);
    setStatus(null);

    try {
      const parsed = adminDisputeResolveSchema.parse(disputeResolveValues);
      const result = await resolveOrderDisputeAsAdmin(selectedDispute.id, parsed);
      if (result.error || !result.data) {
        setStatus(result.error ?? "No pudimos resolver la disputa.");
        return;
      }
      setDisputes((current) =>
        current.map((item) => (item.id === result.data?.id ? result.data : item)),
      );
      if (parsed.processRefund) {
        router.refresh();
      }
      setStatus("Disputa actualizada.");
    } catch (error) {
      setStatus(error instanceof ZodError ? error.issues[0]?.message : "Error.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        {WORKFLOW_STEPS.map((step) => (
          <button
            className={`rounded-2xl border p-5 text-left transition ${
              workflow === step.id
                ? "border-brand bg-brand-light/50 ring-2 ring-brand/20"
                : "border-slate-200 bg-white hover:border-brand/30"
            }`}
            key={step.id}
            onClick={() => selectWorkflow(step.id)}
            type="button"
          >
            <p className="text-sm font-bold text-slate-950">{step.title}</p>
            <p className="mt-2 text-sm text-slate-600">{step.description}</p>
          </button>
        ))}
      </section>

      {!workflow ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-600">
          Elige un flujo para comenzar.
        </p>
      ) : null}

      {workflow === "confirm_payment" || workflow === "process_refund" ? (
        <OrderPicker
          orders={eligibleOrders}
          selectedOrderId={selectedOrderId}
          onSelect={(order) => {
            setSelectedOrderId(order.id);
            setRefundValues((current) => ({
              ...current,
              refundAmount: order.total,
            }));
            setStatus(null);
          }}
        />
      ) : null}

      {workflow === "manage_dispute" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <OrderPicker
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelect={(order) => {
              setSelectedOrderId(order.id);
              setSelectedDisputeId(null);
              setStatus(null);
            }}
          />
          <DisputePicker
            disputes={openDisputes}
            selectedDisputeId={selectedDisputeId}
            onSelect={(dispute) => {
              setSelectedDisputeId(dispute.id);
              setDisputeResolveValues((current) => ({
                ...current,
                refundAmount: dispute.orderTotal,
              }));
              setStatus(null);
            }}
          />
        </div>
      ) : null}

      {status ? (
        <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
          {status}
        </p>
      ) : null}

      {workflow === "confirm_payment" && selectedOrder ? (
        <FormPanel title="Paso 2 · Confirmar pago">
          <form className="space-y-4" onSubmit={submitPayment}>
            <p className="text-sm text-slate-600">
              Pedido {selectedOrder.id.slice(0, 8)}… ·{" "}
              {formatAdminMoney(selectedOrder.total, selectedOrder.currency)} ·{" "}
              {selectedOrder.buyerName}
            </p>
            <Input
              label="Referencia de pago"
              name="paymentReference"
              onChange={(event) =>
                setPaymentValues({ paymentReference: event.target.value })
              }
              value={paymentValues.paymentReference}
            />
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Guardando..." : "Confirmar pago"}
            </Button>
          </form>
        </FormPanel>
      ) : null}

      {workflow === "process_refund" && selectedOrder ? (
        <FormPanel title="Paso 2 · Reembolso guiado">
          <form className="space-y-4" onSubmit={submitRefund}>
            <p className="text-sm text-slate-600">
              Total del pedido:{" "}
              {formatAdminMoney(selectedOrder.total, selectedOrder.currency)}
            </p>
            <Input
              label="Monto a reembolsar"
              name="refundAmount"
              onChange={(event) =>
                setRefundValues((current) => ({
                  ...current,
                  refundAmount: Number(event.target.value),
                }))
              }
              type="number"
              value={String(refundValues.refundAmount || selectedOrder.total)}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">
                Motivo del reembolso
              </span>
              <textarea
                className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                onChange={(event) =>
                  setRefundValues((current) => ({
                    ...current,
                    refundReason: event.target.value,
                  }))
                }
                value={refundValues.refundReason}
              />
            </label>
            <Input
              helperText="Opcional"
              label="Referencia del reembolso"
              name="paymentReference"
              onChange={(event) =>
                setRefundValues((current) => ({
                  ...current,
                  paymentReference: event.target.value,
                }))
              }
              value={refundValues.paymentReference ?? ""}
            />
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Procesando..." : "Procesar reembolso"}
            </Button>
          </form>
        </FormPanel>
      ) : null}

      {workflow === "manage_dispute" && selectedOrder && !selectedDispute ? (
        <FormPanel title="Abrir disputa">
          <form className="space-y-4" onSubmit={submitDisputeCreate}>
            <p className="text-sm text-slate-600">
              Pedido {selectedOrder.id.slice(0, 8)}… ·{" "}
              <OrderStatusBadge status={selectedOrder.status} />
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">Motivo</span>
              <textarea
                className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                onChange={(event) =>
                  setDisputeCreateValues((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                value={disputeCreateValues.reason}
              />
            </label>
            <Button disabled={isSaving} type="submit" variant="secondary">
              {isSaving ? "Creando..." : "Registrar disputa"}
            </Button>
          </form>
        </FormPanel>
      ) : null}

      {workflow === "manage_dispute" && selectedDispute ? (
        <FormPanel title="Resolver disputa">
          <form className="space-y-4" onSubmit={submitDisputeResolve}>
            <div className="flex flex-wrap items-center gap-2">
              <DisputeStatusBadge status={selectedDispute.status} />
              <span className="text-sm text-slate-600">
                Pedido {selectedDispute.orderId.slice(0, 8)}… ·{" "}
                {selectedDispute.reason}
              </span>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">Nuevo estado</span>
              <select
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) =>
                  setDisputeResolveValues((current) => ({
                    ...current,
                    status: event.target.value as OrderDisputeStatus,
                  }))
                }
                value={disputeResolveValues.status}
              >
                {ORDER_DISPUTE_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {ORDER_DISPUTE_STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">Nota interna</span>
              <textarea
                className="min-h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                onChange={(event) =>
                  setDisputeResolveValues((current) => ({
                    ...current,
                    adminNote: event.target.value,
                  }))
                }
                value={disputeResolveValues.adminNote ?? ""}
              />
            </label>
            <Input
              label="Monto de reembolso (si aplica)"
              name="refundAmount"
              onChange={(event) =>
                setDisputeResolveValues((current) => ({
                  ...current,
                  refundAmount: Number(event.target.value),
                }))
              }
              type="number"
              value={String(disputeResolveValues.refundAmount ?? 0)}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                checked={disputeResolveValues.processRefund}
                onChange={(event) =>
                  setDisputeResolveValues((current) => ({
                    ...current,
                    processRefund: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Procesar reembolso al resolver
            </label>
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Guardando..." : "Resolver disputa"}
            </Button>
          </form>
        </FormPanel>
      ) : null}
    </div>
  );
}

function OrderPicker({
  orders,
  selectedOrderId,
  onSelect,
}: Readonly<{
  orders: AdminOrderRecord[];
  selectedOrderId: string | null;
  onSelect: (order: AdminOrderRecord) => void;
}>) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-950">Seleccionar pedido</h3>
      </div>
      {orders.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-600">No hay pedidos elegibles.</p>
      ) : (
        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
          {orders.map((order) => (
            <li key={order.id}>
              <button
                className={`flex w-full flex-col gap-1 px-5 py-3 text-left transition ${
                  selectedOrderId === order.id ? "bg-brand-light/60" : "hover:bg-slate-50"
                }`}
                onClick={() => onSelect(order)}
                type="button"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-950">
                    {formatAdminMoney(order.total, order.currency)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </span>
                <span className="text-xs text-slate-500">
                  {order.buyerName} · {ORDER_STATUS_LABELS[order.status]} ·{" "}
                  {formatAdminDate(order.createdAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DisputePicker({
  disputes,
  selectedDisputeId,
  onSelect,
}: Readonly<{
  disputes: AdminDisputeRecord[];
  selectedDisputeId: string | null;
  onSelect: (dispute: AdminDisputeRecord) => void;
}>) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-950">Disputas abiertas</h3>
      </div>
      {disputes.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-600">No hay disputas activas.</p>
      ) : (
        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
          {disputes.map((dispute) => (
            <li key={dispute.id}>
              <button
                className={`flex w-full flex-col gap-1 px-5 py-3 text-left transition ${
                  selectedDisputeId === dispute.id
                    ? "bg-brand-light/60"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => onSelect(dispute)}
                type="button"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <DisputeStatusBadge status={dispute.status} />
                  <span className="text-sm font-semibold text-slate-950">
                    {dispute.buyerName}
                  </span>
                </span>
                <span className="text-xs text-slate-500 line-clamp-2">{dispute.reason}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FormPanel({
  children,
  title,
}: Readonly<{ children: React.ReactNode; title: string }>) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}
