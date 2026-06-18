"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, PencilLine, Trash2 } from "lucide-react";

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
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.key}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
                <p className="text-sm text-slate-500">
                  {section.products.length}{" "}
                  {section.products.length === 1 ? "publicacion" : "publicaciones"}
                </p>
              </div>
            </div>

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
