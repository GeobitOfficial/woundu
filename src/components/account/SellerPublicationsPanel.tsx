"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, LayoutGrid, List, PencilLine, Trash2 } from "lucide-react";

import { Button } from "@/components/ui";
import { deleteProduct } from "@/features/products/services/productMutations";
import type { SellerProductListItem } from "@/features/products/services/sellerProductService";
import {
  SELLER_PRODUCT_STATUS_LABEL,
  SELLER_PRODUCT_STATUS_STYLE,
} from "@/lib/account/sellerProductStatusUi";
import { formatMoney } from "@/lib/currency/formatMoney";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/utils/productDisplay";

type SellerPublicationCardProps = Readonly<{
  product: SellerProductListItem;
  onDelete: (product: SellerProductListItem) => void;
  isDeleting: boolean;
}>;

export function SellerPublicationCard({
  product,
  onDelete,
  isDeleting,
}: SellerPublicationCardProps) {
  const imageUrl = getProductImageUrl(product.primaryImagePath);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] bg-slate-100">
        {imageUrl ? (
          <img
            alt={product.title}
            className="h-full w-full object-cover"
            src={imageUrl}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImageIcon aria-hidden className="h-8 w-8" />
            <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm",
            SELLER_PRODUCT_STATUS_STYLE[product.status] ??
              "bg-white/95 text-slate-800",
          )}
        >
          {SELLER_PRODUCT_STATUS_LABEL[product.status]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-slate-950">
          {product.title}
        </h3>
        <p className="mt-2 text-base font-black text-brand-dark">
          {formatMoney(product.price, product.currency)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {product.country ?? "Sin pais"} · {product.currency} · Stock: {product.stock}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand/25 bg-brand-light/40 px-3 py-2 text-xs font-bold text-brand-dark transition hover:bg-brand-light"
            href={`/cuenta/productos/${product.id}/editar`}
          >
            <PencilLine aria-hidden className="h-3.5 w-3.5" />
            Editar
          </Link>
          <button
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            disabled={isDeleting}
            onClick={() => onDelete(product)}
            type="button"
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

export function SellerPublicationRow({
  product,
  onDelete,
  isDeleting,
}: SellerPublicationCardProps) {
  const imageUrl = getProductImageUrl(product.primaryImagePath);

  return (
    <article className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Miniatura */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          {imageUrl ? (
            <img
              alt={product.title}
              className="h-full w-full object-cover"
              src={imageUrl}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
              <ImageIcon aria-hidden className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Detalles en texto */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-950">
              {product.title}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-bold shadow-sm",
                SELLER_PRODUCT_STATUS_STYLE[product.status] ??
                  "bg-slate-100 text-slate-800",
              )}
            >
              {SELLER_PRODUCT_STATUS_LABEL[product.status]}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="font-extrabold text-brand-dark text-sm">
              {formatMoney(product.price, product.currency)}
            </span>
            <span>·</span>
            <span>Stock: <strong className="text-slate-800">{product.stock}</strong></span>
            <span>·</span>
            <span>{product.country ?? "Sin país"}</span>
            <span>·</span>
            <span>{product.currency}</span>
          </div>
        </div>
      </div>

      {/* Botones de acción a la derecha */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
        <Link
          className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-brand/25 bg-brand-light/40 px-3.5 py-2 text-xs font-bold text-brand-dark transition hover:bg-brand-light"
          href={`/cuenta/productos/${product.id}/editar`}
        >
          <PencilLine aria-hidden className="h-3.5 w-3.5" />
          Editar
        </Link>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
          disabled={isDeleting}
          onClick={() => onDelete(product)}
          type="button"
        >
          <Trash2 aria-hidden className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </article>
  );
}

type SellerPublicationsPanelProps = Readonly<{
  sections: ReadonlyArray<{
    key: string;
    title: string;
    icon: string | null;
    products: ReadonlyArray<SellerProductListItem>;
  }>;
}>;

export function SellerPublicationsPanel({ sections }: SellerPublicationsPanelProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pendingDelete, setPendingDelete] = useState<SellerProductListItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("seller_view_mode") as "grid" | "list") || "grid";
    }
    return "grid";
  });

  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("seller_view_mode", mode);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (pendingDelete && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!pendingDelete && dialog.open) {
      dialog.close();
    }
  }, [pendingDelete]);

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteProduct(pendingDelete.id);

    setIsDeleting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setPendingDelete(null);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-6">
        {/* Barra de control de vista */}
        <div className="flex items-center justify-end gap-1.5 bg-slate-100/60 border border-slate-200/80 p-1 rounded-xl w-fit ml-auto">
          <button
            onClick={() => toggleViewMode("grid")}
            className={cn(
              "p-1.5 rounded-lg transition-all flex items-center justify-center",
              viewMode === "grid"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-950 hover:bg-slate-200/40"
            )}
            title="Vista Cuadrícula"
            type="button"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleViewMode("list")}
            className={cn(
              "p-1.5 rounded-lg transition-all flex items-center justify-center",
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-950 hover:bg-slate-200/40"
            )}
            title="Vista Lista (Detalles)"
            type="button"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {sections.map((section) => (
          <section className="space-y-4" key={section.key}>
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
                <p className="text-xs text-slate-500">
                  {section.products.length}{" "}
                  {section.products.length === 1 ? "publicacion" : "publicaciones"}
                </p>
              </div>
            </div>

            {viewMode === "grid" ? (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {section.products.map((product) => (
                  <li key={product.id}>
                    <SellerPublicationCard
                      isDeleting={isDeleting && pendingDelete?.id === product.id}
                      onDelete={setPendingDelete}
                      product={product}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                {section.products.map((product) => (
                  <li key={product.id}>
                    <SellerPublicationRow
                      isDeleting={isDeleting && pendingDelete?.id === product.id}
                      onDelete={setPendingDelete}
                      product={product}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <dialog
        className="fixed top-1/2 left-1/2 m-0 w-[min(100vw-2rem,24rem)] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-950/50"
        onCancel={() => {
          if (!isDeleting) {
            setPendingDelete(null);
            setError(null);
          }
        }}
        onClose={() => {
          if (!isDeleting) {
            setPendingDelete(null);
            setError(null);
          }
        }}
        ref={dialogRef}
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-black text-slate-950">Eliminar publicacion</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {pendingDelete
              ? `Se eliminara "${pendingDelete.title}". Esta accion no se puede deshacer.`
              : "Confirma la eliminacion del producto."}
          </p>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              disabled={isDeleting}
              onClick={() => {
                setPendingDelete(null);
                setError(null);
              }}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
              type="button"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
