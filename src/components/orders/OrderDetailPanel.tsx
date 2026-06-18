"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Globe2, MapPin, Phone, Truck } from "lucide-react";
import { ZodError } from "zod";

import { ProductReviewForm } from "@/components/reviews/ProductReviewForm";
import { SellerPayoutMethodsDisplay } from "@/components/account/SellerPayoutMethodsDisplay";
import { Button, Input } from "@/components/ui";
import { sellerHasPayoutMethods } from "@/features/account/services/payoutMapper";
import type { OrderDetailView } from "@/features/orders/types";
import {
  buyerCancelOrder,
  buyerReportPaymentForOrder,
  sellerCancelOrder,
  sellerCompleteOrder,
  sellerConfirmPaymentReceived,
} from "@/features/orders/services/orderMutations";
import {
  getMissingBuyerShippingFields,
  hasCompleteBuyerShippingProfile,
} from "@/lib/account/buyerShippingProfile";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  formatAccountDate,
} from "@/lib/account/orderStatusUi";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";
import {
  buyerPaymentReportSchema,
  type BuyerPaymentReportValues,
} from "@/validations/order";

type OrderDetailPanelProps = Readonly<{
  order: OrderDetailView;
}>;

export function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  const router = useRouter();
  const [paymentReference, setPaymentReference] = useState(
    order.paymentReference ?? "",
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleReportPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const values: BuyerPaymentReportValues = buyerPaymentReportSchema.parse({
        paymentReference,
      });
      const result = await buyerReportPaymentForOrder(order.id, values);
      if (result.error) {
        setStatusMessage(result.error);
        return;
      }
      setStatusMessage("Pago reportado. El vendedor lo confirmará.");
      router.refresh();
    } catch (error) {
      setStatusMessage(
        error instanceof ZodError ? error.issues[0]?.message : "Error al guardar.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function runAction(
    action: () => Promise<{ error: string | null }>,
    success: string,
  ) {
    setIsSaving(true);
    setStatusMessage(null);
    const result = await action();
    setIsSaving(false);
    if (result.error) {
      setStatusMessage(result.error);
      return;
    }
    setStatusMessage(success);
    router.refresh();
  }

  const payout = order.sellerPayout;
  const hasPayoutConfigured = sellerHasPayoutMethods(payout);
  const buyerShipping = {
    country: order.buyerCountry,
    shippingCity: order.buyerShippingCity,
    shippingAddress: order.buyerShippingAddress,
    phone: order.buyerPhone,
  };
  const hasShippingInfo = hasCompleteBuyerShippingProfile(buyerShipping);
  const missingShippingFields = getMissingBuyerShippingFields(buyerShipping);
  const showBuyerShipping =
    order.viewerRole === "seller" || order.viewerRole === "admin";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-slate-500">
              Pedido {order.id.slice(0, 8)}…
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {formatMoney(order.total, order.currency)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatAccountDate(order.createdAt)} · Comprador: {order.buyerName}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              ORDER_STATUS_STYLE[order.status],
            )}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </div>

        <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
          {order.lines.map((line) => (
            <li className="flex justify-between gap-2" key={line.id}>
              <span>
                <Link
                  className="font-semibold text-brand hover:underline"
                  href={`/marketplace/${line.productSlug}`}
                >
                  {line.productTitle}
                </Link>
                <span className="text-slate-500"> · {line.sellerName}</span>
              </span>
              <span className="font-medium">
                {formatMoney(line.totalPrice, order.currency)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {showBuyerShipping ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
            <Truck aria-hidden className="h-5 w-5 text-brand" />
            Datos de envío del comprador
          </h2>
          {hasShippingInfo ? (
            <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              {order.buyerCountry ? (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    País
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 font-medium">
                    <Globe2 aria-hidden className="h-4 w-4 text-slate-400" />
                    {order.buyerCountry}
                  </dd>
                </div>
              ) : null}
              {order.buyerShippingCity ? (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ciudad
                  </dt>
                  <dd className="mt-1 font-medium">{order.buyerShippingCity}</dd>
                </div>
              ) : null}
              {order.buyerShippingAddress ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Dirección
                  </dt>
                  <dd className="mt-1 inline-flex items-start gap-1.5 font-medium">
                    <MapPin
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                    />
                    {order.buyerShippingAddress}
                  </dd>
                </div>
              ) : null}
              {order.buyerPhone ? (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Teléfono
                  </dt>
                  <dd className="mt-1">
                    <a
                      className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
                      href={`tel:${order.buyerPhone.replace(/\s+/g, "")}`}
                    >
                      <Phone aria-hidden className="h-4 w-4" />
                      {order.buyerPhone}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              El comprador aún no completó: {missingShippingFields.join(", ")}.
            </p>
          )}
        </section>
      ) : null}

      {order.viewerRole === "buyer" && order.status === "pending" ? (
        <section className="rounded-2xl border border-brand/20 bg-brand-light/30 p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Paga directamente al vendedor
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Woundu no cobra en línea. Usa los datos del vendedor y luego reporta tu
            pago con la referencia o comprobante.
          </p>

          {hasPayoutConfigured ? (
            <div className="mt-4">
              <SellerPayoutMethodsDisplay payout={payout} />
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              El vendedor aún no configuró sus datos de cobro. Escríbele por soporte
              o espera a que los complete en su cuenta.
            </p>
          )}

          <form className="mt-4 space-y-3" onSubmit={handleReportPayment}>
            <Input
              label="Referencia o número de comprobante"
              name="paymentReference"
              onChange={(event) => setPaymentReference(event.target.value)}
              value={paymentReference}
            />
            <div className="flex flex-wrap gap-2">
              <Button disabled={isSaving} type="submit">
                {isSaving ? "Guardando..." : "Ya pagué — reportar pago"}
              </Button>
              <Button
                disabled={isSaving}
                onClick={() =>
                  void runAction(
                    () => buyerCancelOrder(order.id),
                    "Pedido cancelado.",
                  )
                }
                type="button"
                variant="secondary"
              >
                Cancelar pedido
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {order.viewerRole === "buyer" && order.status === "paid" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          <p>
            Reportaste el pago
            {order.paymentReference ? ` (${order.paymentReference})` : ""}. Espera
            a que el vendedor lo confirme.
          </p>
          <Button
            className="mt-4"
            disabled={isSaving}
            onClick={() =>
              void runAction(() => buyerCancelOrder(order.id), "Pedido cancelado.")
            }
            type="button"
            variant="secondary"
          >
            Cancelar pedido
          </Button>
        </section>
      ) : null}

      {order.viewerRole === "seller" && ["pending", "paid", "processing"].includes(order.status) ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">Gestión del vendedor</h2>
          <p className="mt-2 text-sm text-slate-600">
            Confirma cuando recibas el pago directo del comprador y completa la venta
            cuando entregues el producto.
          </p>
          {order.paymentReference ? (
            <p className="mt-3 text-sm">
              Referencia del comprador:{" "}
              <span className="font-mono font-semibold">{order.paymentReference}</span>
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {order.status === "paid" ? (
              <Button
                disabled={isSaving}
                onClick={() =>
                  void runAction(
                    () => sellerConfirmPaymentReceived(order.id),
                    "Pago confirmado. Pedido en proceso.",
                  )
                }
                type="button"
              >
                Confirmar pago recibido
              </Button>
            ) : null}
            {["paid", "processing"].includes(order.status) ? (
              <Button
                disabled={isSaving}
                onClick={() =>
                  void runAction(
                    () => sellerCompleteOrder(order.id),
                    "Venta completada.",
                  )
                }
                type="button"
              >
                Marcar como completado
              </Button>
            ) : null}
            <Button
              disabled={isSaving}
              onClick={() =>
                void runAction(
                  () => sellerCancelOrder(order.id),
                  "Pedido cancelado.",
                )
              }
              type="button"
              variant="secondary"
            >
              Cancelar venta
            </Button>
          </div>
        </section>
      ) : null}

      {order.viewerRole === "buyer" && order.status === "completed" ? (
        <div className="space-y-4">
          {order.lines.map((line) => (
            <ProductReviewForm
              existingReview={
                line.review?.reviewId && line.review.rating != null
                  ? {
                      reviewId: line.review.reviewId,
                      rating: line.review.rating,
                      comment: line.review.comment,
                    }
                  : null
              }
              key={line.id}
              productId={line.productId}
              productTitle={line.productTitle}
              sellerId={line.sellerId}
            />
          ))}
        </div>
      ) : null}

      {statusMessage ? (
        <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
          {statusMessage}
        </p>
      ) : null}

      <Link className="text-sm font-bold text-brand hover:underline" href="/cuenta">
        ← Volver a mi cuenta
      </Link>
    </div>
  );
}
