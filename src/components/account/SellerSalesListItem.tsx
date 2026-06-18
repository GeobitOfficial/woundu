"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Globe2,
  MapPin,
  Package,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";

import type { SellerOrderLineView } from "@/features/account/types";
import {
  getSellerSaleActionLabel,
  isSellerPendingOrderStatus,
} from "@/lib/account/sellerSalesGroups";
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
import { getProductImageUrl } from "@/utils/productDisplay";
import type { OrderStatus } from "@/types";

type SellerSalesListItemProps = Readonly<{
  line: SellerOrderLineView;
  showAction?: boolean;
}>;

const STATUS_ACCENT: Record<OrderStatus, string> = {
  pending: "border-l-brand",
  paid: "border-l-brand-dark",
  processing: "border-l-indigo-500",
  completed: "border-l-emerald-500",
  cancelled: "border-l-slate-400",
  refunded: "border-l-violet-500",
};

export function SellerSalesListItem({
  line,
  showAction = true,
}: SellerSalesListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const orderHref = `/cuenta/pedidos/${line.orderId}`;
  const needsAction = isSellerPendingOrderStatus(line.orderStatus);
  const imageUrl = getProductImageUrl(line.productImagePath);
  const productHref = line.productSlug
    ? `/marketplace/${encodeURIComponent(line.productSlug)}`
    : null;
  const buyerShipping = {
    country: line.buyerCountry,
    shippingCity: line.buyerShippingCity,
    shippingAddress: line.buyerShippingAddress,
    phone: line.buyerPhone,
  };
  const hasShippingInfo = hasCompleteBuyerShippingProfile(buyerShipping);
  const missingShippingFields = getMissingBuyerShippingFields(buyerShipping);

  function toggleExpanded() {
    setExpanded((current) => !current);
  }

  function handleSummaryKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded();
    }
  }

  return (
    <li>
      <article
        className={cn(
          "overflow-hidden rounded-xl border border-slate-200/80 border-l-[3px] bg-slate-50/50 text-sm transition",
          STATUS_ACCENT[line.orderStatus],
          line.orderStatus === "paid" && "bg-brand-light/20",
          expanded && "bg-white shadow-sm",
        )}
      >
        <div
          aria-expanded={expanded}
          className="flex cursor-pointer gap-3 p-4"
          onClick={toggleExpanded}
          onKeyDown={handleSummaryKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-[#232f3e]">
            {imageUrl ? (
              <img
                alt={line.productTitle}
                className="h-full w-full object-cover"
                src={imageUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/70">
                <Package aria-hidden className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-xs font-bold text-brand">
                #{line.orderId.slice(0, 8).toUpperCase()}
              </p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  ORDER_STATUS_STYLE[line.orderStatus],
                )}
              >
                {ORDER_STATUS_LABEL[line.orderStatus]}
              </span>
            </div>

            <p className="mt-1 truncate font-semibold text-slate-900">
              {line.productTitle}
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">
              {formatMoney(line.lineTotal, line.currency)}
              <span className="ml-1 text-xs font-semibold text-slate-500">
                · x{line.quantity}
              </span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {formatAccountDate(line.orderCreatedAt)}
            </p>
          </div>

          <ChevronDown
            aria-hidden
            className={cn(
              "mt-1 h-5 w-5 shrink-0 text-slate-400 transition",
              expanded && "rotate-180",
            )}
          />
        </div>

        {expanded ? (
          <div className="border-t border-slate-200/80 bg-white px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <section>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Venta
                </h4>
                <dl className="mt-2 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between gap-3">
                    <dt>Producto</dt>
                    <dd className="text-right font-semibold text-slate-900">
                      {productHref ? (
                        <Link
                          className="text-brand hover:underline"
                          href={productHref}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {line.productTitle}
                        </Link>
                      ) : (
                        line.productTitle
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Cantidad</dt>
                    <dd className="font-medium">{line.quantity}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Precio unitario</dt>
                    <dd className="font-medium">
                      {formatMoney(line.unitPrice, line.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Total linea</dt>
                    <dd className="font-bold text-slate-950">
                      {formatMoney(line.lineTotal, line.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Total pedido</dt>
                    <dd className="font-medium">
                      {formatMoney(line.orderTotal, line.currency)}
                    </dd>
                  </div>
                  {line.paymentReference ? (
                    <div className="flex justify-between gap-3">
                      <dt>Referencia pago</dt>
                      <dd className="font-mono text-xs font-semibold">
                        {line.paymentReference}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              <section>
                <h4 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <UserRound aria-hidden className="h-3.5 w-3.5" />
                  Cliente
                </h4>
                <dl className="mt-2 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between gap-3">
                    <dt>Nombre</dt>
                    <dd className="text-right font-semibold text-slate-900">
                      {line.buyerName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Fecha pedido</dt>
                    <dd className="text-right text-xs text-slate-600">
                      {formatAccountDate(line.orderCreatedAt)}
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <h4 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Truck aria-hidden className="h-3.5 w-3.5" />
                  Datos de envío
                </h4>
                {hasShippingInfo ? (
                  <dl className="mt-2 space-y-2 text-sm text-slate-700">
                    {line.buyerCountry ? (
                      <div className="flex justify-between gap-3">
                        <dt>País</dt>
                        <dd className="inline-flex items-center gap-1 font-medium">
                          <Globe2
                            aria-hidden
                            className="h-3.5 w-3.5 text-slate-400"
                          />
                          {line.buyerCountry}
                        </dd>
                      </div>
                    ) : null}
                    {line.buyerShippingCity ? (
                      <div className="flex justify-between gap-3">
                        <dt>Ciudad</dt>
                        <dd className="text-right font-medium">
                          {line.buyerShippingCity}
                        </dd>
                      </div>
                    ) : null}
                    {line.buyerShippingAddress ? (
                      <div className="flex justify-between gap-3">
                        <dt>Dirección</dt>
                        <dd className="inline-flex max-w-[14rem] items-start gap-1 text-right font-medium">
                          <MapPin
                            aria-hidden
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                          />
                          {line.buyerShippingAddress}
                        </dd>
                      </div>
                    ) : null}
                    {line.buyerPhone ? (
                      <div className="flex justify-between gap-3">
                        <dt>Teléfono</dt>
                        <dd>
                          <a
                            className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                            href={`tel:${line.buyerPhone.replace(/\s+/g, "")}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Phone aria-hidden className="h-3.5 w-3.5" />
                            {line.buyerPhone}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    El comprador aún no completó:{" "}
                    {missingShippingFields.join(", ")}.
                  </p>
                )}
              </section>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              <Link
                className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
                href={orderHref}
                onClick={(event) => event.stopPropagation()}
              >
                {needsAction
                  ? getSellerSaleActionLabel(line.orderStatus)
                  : "Ver pedido completo"}
                <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : null}

        {showAction && !expanded ? (
          <div className="border-t border-slate-200/60 px-4 py-2">
            <button
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline"
              onClick={toggleExpanded}
              type="button"
            >
              Ver detalle de la venta
              <ChevronDown aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </article>
    </li>
  );
}
