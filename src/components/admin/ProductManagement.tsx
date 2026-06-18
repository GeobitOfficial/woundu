"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ZodError } from "zod";

import { ProductStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button, Input } from "@/components/ui";
import {
  setProductModerationAsAdmin,
  updateProductAsAdmin,
} from "@/features/admin/services/adminMutations";
import type { AdminProductRecord } from "@/features/admin/types";
import {
  formatAdminDate,
  formatAdminMoney,
  PRODUCT_STATUS_LABELS,
} from "@/lib/admin/labels";
import type { ProductStatus } from "@/types";
import {
  adminProductUpdateSchema,
  type AdminProductUpdateValues,
} from "@/validations/admin";

const ADMIN_PRODUCT_STATUSES = Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[];

type ProductManagementProps = Readonly<{
  initialProducts: AdminProductRecord[];
}>;

export function ProductManagement({ initialProducts }: ProductManagementProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ProductStatus>("all");
  const [values, setValues] = useState<AdminProductUpdateValues | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdminProductUpdateValues, string>>
  >({});
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (filter === "all") {
      return products;
    }

    return products.filter((product) => product.status === filter);
  }, [filter, products]);

  const selectedProduct =
    products.find((product) => product.id === selectedId) ?? null;

  function startEdit(product: AdminProductRecord) {
    setSelectedId(product.id);
    setValues({
      title: product.title,
      description: product.description,
      price: product.price,
      status: product.status,
      moderationNote: product.moderationNote ?? "",
      city: product.city ?? "",
      country: product.country ?? "",
    });
    setErrors({});
    setStatus(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct || !values) {
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      const parsed = adminProductUpdateSchema.parse(values);
      const result = await updateProductAsAdmin(selectedProduct.id, parsed);

      if (result.error || !result.data) {
        setStatus(result.error ?? "No pudimos guardar el producto.");
        return;
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === result.data?.id ? result.data : item,
        ),
      );
      setStatus("Producto actualizado correctamente.");
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(
          error.issues.reduce<Partial<Record<keyof AdminProductUpdateValues, string>>>(
            (accumulator, issue) => {
              const field = issue.path[0];
              if (typeof field === "string") {
                accumulator[field as keyof AdminProductUpdateValues] = issue.message;
              }
              return accumulator;
            },
            {},
          ),
        );
        return;
      }

      setStatus("No pudimos guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQuickModeration(
    product: AdminProductRecord,
    nextStatus: "active" | "rejected",
  ) {
    setModeratingId(product.id);
    setStatus(null);

    const result = await setProductModerationAsAdmin(product.id, {
      status: nextStatus,
      moderationNote:
        nextStatus === "rejected" ? "Publicación rechazada en revisión." : "",
    });

    setModeratingId(null);

    if (result.error || !result.data) {
      setStatus(result.error ?? "No pudimos actualizar el producto.");
      return;
    }

    setProducts((current) =>
      current.map((item) => (item.id === result.data?.id ? result.data : item)),
    );
    setStatus(
      nextStatus === "active"
        ? `"${product.title}" aprobado y publicado.`
        : `"${product.title}" rechazado.`,
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} label="Todos" onClick={() => setFilter("all")} />
        <FilterChip
          active={filter === "pending_review"}
          label="Pendientes"
          onClick={() => setFilter("pending_review")}
        />
        <FilterChip
          active={filter === "active"}
          label="Disponibles"
          onClick={() => setFilter("active")}
        />
        <FilterChip
          active={filter === "rejected"}
          label="Rechazados"
          onClick={() => setFilter("rejected")}
        />
      </section>

      {status ? (
        <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
          {status}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">
              Productos registrados ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-600">
              No hay productos en este filtro.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <li
                  className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                  key={product.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{product.title}</p>
                      <ProductStatusBadge status={product.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatAdminMoney(product.price, product.currency)} ·{" "}
                      {product.sellerName}
                      {product.categoryName ? ` · ${product.categoryName}` : ""}
                      {product.country ? ` · ${product.country}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Creado {formatAdminDate(product.createdAt)}
                      {product.reviewedAt
                        ? ` · Revisado ${formatAdminDate(product.reviewedAt)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.status === "pending_review" ? (
                      <>
                        <Button
                          disabled={moderatingId === product.id}
                          onClick={() => handleQuickModeration(product, "active")}
                          size="sm"
                          type="button"
                        >
                          Aprobar
                        </Button>
                        <Button
                          disabled={moderatingId === product.id}
                          onClick={() => handleQuickModeration(product, "rejected")}
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          Rechazar
                        </Button>
                      </>
                    ) : null}
                    <Button
                      onClick={() => startEdit(product)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Editar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {!selectedProduct || !values ? (
            <p className="text-sm text-slate-600">
              Selecciona un producto para revisar datos, cambiar estado o dejar una
              nota de moderación.
            </p>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-950">Editar producto</h2>
              <p className="mt-1 text-sm text-slate-600">
                Vendedor: {selectedProduct.sellerName}
                {selectedProduct.sellerEmail
                  ? ` (${selectedProduct.sellerEmail})`
                  : ""}
              </p>
              {selectedProduct.reviewedAt ? (
                <p className="mt-1 text-xs text-slate-500">
                  Revisado el {formatAdminDate(selectedProduct.reviewedAt)}
                </p>
              ) : null}

              <form className="mt-5 space-y-4" noValidate onSubmit={handleSubmit}>
                <Input
                  error={errors.title}
                  label="Título"
                  name="title"
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, title: event.target.value } : current,
                    )
                  }
                  value={values.title}
                />

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-800">Descripción</span>
                  <textarea
                    className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    name="description"
                    onChange={(event) =>
                      setValues((current) =>
                        current
                          ? { ...current, description: event.target.value }
                          : current,
                      )
                    }
                    value={values.description}
                  />
                  {errors.description ? (
                    <span className="text-sm text-red-600">{errors.description}</span>
                  ) : null}
                </label>

                <Input
                  error={errors.price}
                  label="Precio"
                  name="price"
                  onChange={(event) =>
                    setValues((current) =>
                      current
                        ? { ...current, price: Number(event.target.value) }
                        : current,
                    )
                  }
                  type="number"
                  value={String(values.price)}
                />

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-800">Estado</span>
                  <select
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
                    name="status"
                    onChange={(event) =>
                      setValues((current) =>
                        current
                          ? {
                              ...current,
                              status: event.target.value as ProductStatus,
                            }
                          : current,
                      )
                    }
                    value={values.status}
                  >
                    {ADMIN_PRODUCT_STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {PRODUCT_STATUS_LABELS[item]}
                      </option>
                    ))}
                  </select>
                </label>

                <Input
                  error={errors.city}
                  label="Ciudad"
                  name="city"
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, city: event.target.value } : current,
                    )
                  }
                  value={values.city ?? ""}
                />

                <Input
                  error={errors.country}
                  label="País"
                  name="country"
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, country: event.target.value } : current,
                    )
                  }
                  value={values.country ?? ""}
                />

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-800">
                    Nota de moderación
                  </span>
                  <textarea
                    className="min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    name="moderationNote"
                    onChange={(event) =>
                      setValues((current) =>
                        current
                          ? { ...current, moderationNote: event.target.value }
                          : current,
                      )
                    }
                    value={values.moderationNote ?? ""}
                  />
                </label>

                {status ? (
                  <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
                    {status}
                  </p>
                ) : null}

                <Button className="w-full" disabled={isSaving} type="submit">
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
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
