"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui";
import { restoreProductAsAdmin } from "@/features/admin/services/adminMutations";
import type { AdminDeletedProductRecord } from "@/features/admin/types";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/labels";
import type { AdminProductRestoreValues } from "@/validations/admin";

type DeletedProductManagementProps = Readonly<{
  initialProducts: AdminDeletedProductRecord[];
}>;

const RESTORE_STATUSES: AdminProductRestoreValues["status"][] = [
  "paused",
  "draft",
  "active",
];

export function DeletedProductManagement({
  initialProducts,
}: DeletedProductManagementProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [restoreStatus, setRestoreStatus] = useState<
    Record<string, AdminProductRestoreValues["status"]>
  >({});
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleRestore(product: AdminDeletedProductRecord) {
    const nextStatus = restoreStatus[product.id] ?? "paused";
    setRestoringId(product.id);
    setStatus(null);

    const result = await restoreProductAsAdmin(product.id, { status: nextStatus });
    setRestoringId(null);

    if (result.error) {
      setStatus(result.error);
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    setStatus(`"${product.title}" restaurado como ${nextStatus}.`);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-600">
        No hay productos eliminados pendientes de restaurar.
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {status ? (
        <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
          {status}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">
            Productos eliminados ({products.length})
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Restaura publicaciones soft-deleted. Por defecto vuelven en estado pausado.
          </p>
        </div>

        <ul className="divide-y divide-slate-100">
          {products.map((product) => (
            <li
              className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              key={product.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{product.title}</p>
                  <ProductStatusBadge status={product.status} />
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatAdminMoney(product.price, product.currency)} · {product.sellerName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Eliminado {formatAdminDate(product.deletedAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="font-medium">Estado al restaurar</span>
                  <select
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                    onChange={(event) =>
                      setRestoreStatus((current) => ({
                        ...current,
                        [product.id]: event.target.value as AdminProductRestoreValues["status"],
                      }))
                    }
                    value={restoreStatus[product.id] ?? "paused"}
                  >
                    {RESTORE_STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  disabled={restoringId === product.id}
                  onClick={() => void handleRestore(product)}
                  size="sm"
                  type="button"
                >
                  {restoringId === product.id ? "Restaurando..." : "Restaurar"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
