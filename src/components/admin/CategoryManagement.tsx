"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ZodError } from "zod";

import { getCategoryIcon } from "@/components/marketplace/categoryIconMap";
import { Button, Input } from "@/components/ui";
import {
  CATEGORY_ICON_LABELS,
  CATEGORY_ICON_OPTIONS,
} from "@/constants/categoryIcons";
import {
  createCategory,
  toggleCategoryActive,
  updateCategory,
} from "@/features/categories/services/categoryMutations";
import type { Category } from "@/types";
import {
  categoryFormSchema,
  slugifyCategoryName,
  type CategoryFormValues,
} from "@/validations/category";

type CategoryManagementProps = Readonly<{
  initialCategories: Category[];
}>;

type FormMode =
  | Readonly<{ type: "create" }>
  | Readonly<{ type: "edit"; categoryId: string }>;

const emptyValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  icon: "Package",
  sortOrder: 0,
  isActive: true,
};

export function CategoryManagement({ initialCategories }: CategoryManagementProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [mode, setMode] = useState<FormMode>({ type: "create" });
  const [values, setValues] = useState<CategoryFormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormValues, string>>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const activeCount = useMemo(
    () => categories.filter((category) => category.isActive).length,
    [categories],
  );

  function resetCreateForm() {
    setMode({ type: "create" });
    setValues({
      ...emptyValues,
      sortOrder: categories.length > 0 ? categories.length * 10 : 10,
    });
    setErrors({});
    setStatus(null);
    setSlugTouched(false);
  }

  function startEdit(category: Category) {
    setMode({ type: "edit", categoryId: category.id });
    setValues({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      icon: (category.icon as CategoryFormValues["icon"]) ?? "Package",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setErrors({});
    setStatus(null);
    setSlugTouched(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      const parsed = categoryFormSchema.parse(values);
      const result =
        mode.type === "create"
          ? await createCategory(parsed)
          : await updateCategory(mode.categoryId, parsed);

      if (result.error || !result.data) {
        setStatus(result.error ?? "No pudimos guardar la categoría.");
        return;
      }

      const savedCategory = result.data;

      setCategories((current) => {
        if (mode.type === "create") {
          return [...current, savedCategory].sort(sortCategories);
        }

        return current
          .map((category) =>
            category.id === savedCategory.id ? savedCategory : category,
          )
          .sort(sortCategories);
      });

      setStatus(
        mode.type === "create"
          ? "Categoría creada. Ya aparecerá en el marketplace si está activa."
          : "Categoría actualizada correctamente.",
      );
      resetCreateForm();
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(
          error.issues.reduce<Partial<Record<keyof CategoryFormValues, string>>>(
            (accumulator, issue) => {
              const field = issue.path[0];
              if (typeof field === "string") {
                accumulator[field as keyof CategoryFormValues] = issue.message;
              }
              return accumulator;
            },
            {},
          ),
        );
        return;
      }

      setStatus("No pudimos guardar la categoría. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(category: Category) {
    setIsSaving(true);
    setStatus(null);

    const result = await toggleCategoryActive(category.id, !category.isActive);
    setIsSaving(false);

    if (result.error || !result.data) {
      setStatus(result.error ?? "No pudimos cambiar el estado de la categoría.");
      return;
    }

    const updatedCategory = result.data;

    setCategories((current) =>
      current
        .map((item) => (item.id === category.id ? updatedCategory : item))
        .sort(sortCategories),
    );
    setStatus(
      updatedCategory.isActive
        ? `"${updatedCategory.name}" ahora está visible en el marketplace.`
        : `"${updatedCategory.name}" quedó oculta del marketplace.`,
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total categorías" value={String(categories.length)} />
        <MetricCard label="Activas en marketplace" value={String(activeCount)} />
        <MetricCard
          label="Inactivas"
          value={String(categories.length - activeCount)}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {mode.type === "create" ? "Nueva categoría" : "Editar categoría"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Estas categorías alimentan filtros, publicación y navegación del
                marketplace.
              </p>
            </div>
            {mode.type === "edit" ? (
              <Button onClick={resetCreateForm} size="sm" type="button" variant="secondary">
                Cancelar edición
              </Button>
            ) : null}
          </div>

          <form className="space-y-4" noValidate onSubmit={handleSubmit}>
            <Input
              error={errors.name}
              label="Nombre"
              name="name"
              onChange={(event) => {
                const name = event.target.value;
                setValues((current) => ({
                  ...current,
                  name,
                  slug: slugTouched ? current.slug : slugifyCategoryName(name),
                }));
              }}
              value={values.name}
            />

            <Input
              error={errors.slug}
              helperText="Se usa en la URL del marketplace, por ejemplo ?categoria=tecnologia"
              label="Slug"
              name="slug"
              onChange={(event) => {
                setSlugTouched(true);
                setValues((current) => ({ ...current, slug: event.target.value }));
              }}
              value={values.slug}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">Descripción</span>
              <textarea
                className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                name="description"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                value={values.description ?? ""}
              />
              {errors.description ? (
                <span className="text-sm text-red-600">{errors.description}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">Icono</span>
              <select
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                name="icon"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    icon: event.target.value as CategoryFormValues["icon"],
                  }))
                }
                value={values.icon}
              >
                {CATEGORY_ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {CATEGORY_ICON_LABELS[icon]}
                  </option>
                ))}
              </select>
              {errors.icon ? (
                <span className="text-sm text-red-600">{errors.icon}</span>
              ) : null}
            </label>

            <Input
              error={errors.sortOrder}
              label="Orden"
              name="sortOrder"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value),
                }))
              }
              type="number"
              value={String(values.sortOrder)}
            />

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                checked={values.isActive}
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                name="isActive"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span className="text-sm font-medium text-slate-800">
                Visible en marketplace
              </span>
            </label>

            {status ? (
              <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
                {status}
              </p>
            ) : null}

            <Button className="w-full sm:w-auto" disabled={isSaving} type="submit">
              {isSaving
                ? "Guardando..."
                : mode.type === "create"
                  ? "Crear categoría"
                  : "Guardar cambios"}
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">Categorías actuales</h2>
            <p className="mt-1 text-sm text-slate-600">
              Activa, edita o despublica categorías del catálogo.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-600">
              Aún no hay categorías registradas. Crea la primera desde el formulario.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {categories.map((category) => (
                <CategoryRow
                  category={category}
                  isSaving={isSaving}
                  key={category.id}
                  onEdit={startEdit}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  isSaving,
  onEdit,
  onToggleActive,
}: Readonly<{
  category: Category;
  isSaving: boolean;
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}>) {
  const Icon = getCategoryIcon(category.icon);

  return (
    <li className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-950">{category.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                category.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {category.isActive ? "Activa" : "Inactiva"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Slug: <code>{category.slug}</code> · Orden: {category.sortOrder}
          </p>
          {category.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {category.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={isSaving}
          onClick={() => onEdit(category)}
          size="sm"
          type="button"
          variant="secondary"
        >
          Editar
        </Button>
        <Button
          disabled={isSaving}
          onClick={() => onToggleActive(category)}
          size="sm"
          type="button"
          variant={category.isActive ? "secondary" : "primary"}
        >
          {category.isActive ? "Desactivar" : "Activar"}
        </Button>
      </div>
    </li>
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

function sortCategories(first: Category, second: Category) {
  if (first.sortOrder !== second.sortOrder) {
    return first.sortOrder - second.sortOrder;
  }

  return first.name.localeCompare(second.name, "es");
}
