"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ZodError } from "zod";

import { LATIN_AMERICA_COUNTRIES } from "@/constants/latinAmericaCountries";
import { Button, Input } from "@/components/ui";
import { createProduct } from "@/features/products/services/productMutations";
import type { Category } from "@/types";
import {
  createProductSchema,
  type CreateProductFormValues,
} from "@/validations/product";

type ProductFormErrors = Partial<Record<keyof CreateProductFormValues, string>>;
type FormStatus = Readonly<{
  type: "success" | "error";
  message: string;
}>;

type ProductFormProps = Readonly<{
  categories: Category[];
}>;

export function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const values = createProductSchema.parse({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        price: String(formData.get("price") ?? ""),
        compareAtPrice: String(formData.get("compareAtPrice") ?? ""),
        categoryId: String(formData.get("categoryId") ?? ""),
        condition: String(formData.get("condition") ?? ""),
        city: String(formData.get("city") ?? ""),
        country: String(formData.get("country") ?? ""),
      });

      setErrors({});
      setStatus(null);
      setIsLoading(true);

      const { error } = await createProduct(values);

      if (error) {
        setStatus({ type: "error", message: error });
        return;
      }

      setStatus({
        type: "success",
        message: "Producto publicado. Redirigiendo al marketplace...",
      });
      router.push("/marketplace");
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setStatus(null);
        setErrors(getProductErrors(error));
        return;
      }

      setStatus({
        type: "error",
        message: "No pudimos publicar el producto. Intentalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (categories.length === 0) {
    return (
      <section className="rounded-[2rem] border border-dashed border-emerald-200/80 bg-white/90 p-8 text-center shadow-inner shadow-emerald-900/5 backdrop-blur-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Aun no hay categorias disponibles
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Pronto podras elegir una categoria y publicar tus productos en
          Woundu.
        </p>
        <Link className="mt-6 inline-flex text-sm font-bold text-emerald-700" href="/marketplace">
          Volver al marketplace
        </Link>
      </section>
    );
  }

  return (
    <form
      className="rounded-[2rem] border border-emerald-100/70 bg-white/95 p-5 shadow-xl shadow-emerald-900/10 backdrop-blur-sm sm:p-8"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input
            error={errors.title}
            label="Titulo"
            name="title"
            placeholder="Titulo descriptivo del producto"
            type="text"
          />
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Categoria
          </span>
          <select
            aria-invalid={Boolean(errors.categoryId)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-950/5"
            name="categoryId"
          >
            <option value="">Selecciona una categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <p className="text-xs leading-5 text-red-600">
              {errors.categoryId}
            </p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Condicion
          </span>
          <select
            aria-invalid={Boolean(errors.condition)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-950/5"
            name="condition"
          >
            <option value="">Selecciona condicion</option>
            <option value="new">Nuevo</option>
            <option value="like_new">Como nuevo</option>
            <option value="used">Usado</option>
            <option value="refurbished">Reacondicionado</option>
          </select>
          {errors.condition ? (
            <p className="text-xs leading-5 text-red-600">{errors.condition}</p>
          ) : null}
        </label>

        <Input
          error={errors.price}
          label="Precio de venta"
          min="0"
          name="price"
          placeholder="Precio en tu moneda"
          step="0.01"
          type="number"
        />
        <Input
          error={errors.compareAtPrice}
          label="Precio de referencia (opcional)"
          min="0"
          name="compareAtPrice"
          placeholder="Solo para ofertas"
          step="0.01"
          type="number"
        />
        <p className="text-xs leading-5 text-slate-500 md:col-span-2">
          Si indicas un precio de referencia mayor al precio de venta, el
          producto se mostrará como en oferta en el marketplace.
        </p>
        <Input
          error={errors.city}
          label="Ciudad"
          name="city"
          placeholder="Ciudad o localidad"
          type="text"
        />
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">País</span>
          <select
            aria-invalid={Boolean(errors.country)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-950/5"
            name="country"
          >
            <option value="">Selecciona un país</option>
            {LATIN_AMERICA_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country ? (
            <p className="text-xs leading-5 text-red-600">{errors.country}</p>
          ) : null}
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">
            Descripcion
          </span>
          <textarea
            aria-invalid={Boolean(errors.description)}
            className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-950/5"
            name="description"
            placeholder="Describe el estado, detalles y condiciones del producto."
          />
          {errors.description ? (
            <p className="text-xs leading-5 text-red-600">
              {errors.description}
            </p>
          ) : null}
        </label>
      </div>

      {status ? (
        <p
          className={
            status.type === "success"
              ? "mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : "mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {status.message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Publicando..." : "Publicar producto"}
        </Button>
        <Link
          className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          href="/marketplace"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function getProductErrors(error: ZodError): ProductFormErrors {
  return error.issues.reduce<ProductFormErrors>((accumulator, issue) => {
    const field = issue.path[0];

    if (
      field === "title" ||
      field === "description" ||
      field === "price" ||
      field === "categoryId" ||
      field === "condition" ||
      field === "city" ||
      field === "country" ||
      field === "compareAtPrice"
    ) {
      accumulator[field] = issue.message;
    }

    return accumulator;
  }, {});
}
