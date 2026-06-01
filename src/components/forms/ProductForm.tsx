"use client";



import Link from "next/link";

import { useRouter } from "next/navigation";

import { useMemo, useState, type FormEvent } from "react";

import { ZodError } from "zod";



import {

  ProductCountrySelect,

  useProductCountryCurrency,

} from "@/components/forms/ProductCountrySelect";

import { formatCurrencyLabel } from "@/constants/countryCurrencies";

import { Button, Input } from "@/components/ui";

import {

  createProduct,

  updateProduct,

} from "@/features/products/services/productMutations";

import type { SellerProductEditRecord } from "@/features/products/services/sellerProductService";

import type { SellerLocale } from "@/services/supabase/account/getSellerLocale";

import type { Category } from "@/types";

import {

  createProductSchema,

  updateProductSchema,

  type CreateProductFormValues,

} from "@/validations/product";



type ProductFormErrors = Partial<Record<keyof CreateProductFormValues, string>>;

type FormStatus = Readonly<{

  type: "success" | "error";

  message: string;

}>;



type ProductFormProps = Readonly<{

  categories: Category[];

  sellerLocale: SellerLocale | null;

  mode?: "create" | "edit";

  product?: SellerProductEditRecord;

}>;



export function ProductForm({

  categories,

  mode = "create",

  product,

  sellerLocale,

}: ProductFormProps) {

  const router = useRouter();

  const isEdit = mode === "edit" && product != null;

  const defaultCountry =

    product?.country ?? sellerLocale?.country ?? "";



  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<FormStatus | null>(null);



  const productCurrency = useProductCountryCurrency(selectedCountry);

  const currencyLabel = formatCurrencyLabel(productCurrency);



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const formData = new FormData(event.currentTarget);



    const payload = {

      title: String(formData.get("title") ?? ""),

      description: String(formData.get("description") ?? ""),

      price: String(formData.get("price") ?? ""),

      compareAtPrice: String(formData.get("compareAtPrice") ?? ""),

      categoryId: String(formData.get("categoryId") ?? ""),

      condition: String(formData.get("condition") ?? ""),

      city: String(formData.get("city") ?? ""),

      country: selectedCountry || String(formData.get("country") ?? ""),

    };



    try {

      setErrors({});

      setStatus(null);

      setIsLoading(true);



      if (isEdit) {

        const values = updateProductSchema.parse(payload);

        const { error } = await updateProduct(product.id, values);



        if (error) {

          setStatus({ type: "error", message: error });

          return;

        }



        setStatus({

          type: "success",

          message: "Producto actualizado. Si cambiaste el pais, el precio ahora se muestra en la nueva moneda.",

        });

        router.push("/cuenta");

        router.refresh();

        return;

      }



      const values = createProductSchema.parse(payload);

      const { error } = await createProduct(values);



      if (error) {

        setStatus({ type: "error", message: error });

        return;

      }



      setStatus({

        type: "success",

        message:

          "Producto enviado a revision. Un administrador lo aprobara antes de aparecer en el marketplace.",

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

        message: "No pudimos guardar el producto. Intentalo de nuevo.",

      });

    } finally {

      setIsLoading(false);

    }

  }



  const introMessage = useMemo(() => {

    if (isEdit && product) {

      return (

        <>

          Editando en{" "}

          <span className="font-bold text-brand-dark">{currencyLabel}</span>

          {selectedCountry ? (

            <>

              {" "}

              para el mercado de{" "}

              <span className="font-semibold text-slate-900">{selectedCountry}</span>

            </>

          ) : null}

          . Al cambiar el pais, la moneda del producto se actualiza automaticamente.

        </>

      );

    }



    return (

      <>

        Publicaras en{" "}

        <span className="font-bold text-brand-dark">{currencyLabel}</span>

        {selectedCountry ? (

          <>

            {" "}

            para el mercado de{" "}

            <span className="font-semibold text-slate-900">{selectedCountry}</span>

          </>

        ) : null}

        . Cada producto conserva su pais y moneda aunque cambies tu cuenta despues.

      </>

    );

  }, [currencyLabel, isEdit, product, selectedCountry]);



  if (categories.length === 0) {

    return (

      <section className="rounded-[2rem] border border-dashed border-brand/30 bg-white/90 p-8 text-center shadow-inner shadow-brand/5 backdrop-blur-sm">

        <h2 className="text-2xl font-black tracking-tight text-slate-950">

          Aun no hay categorias disponibles

        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">

          Pronto podras elegir una categoria y publicar tus productos en Woundu.

        </p>

        <Link className="mt-6 inline-flex text-sm font-bold text-brand" href="/marketplace">

          Volver al marketplace

        </Link>

      </section>

    );

  }



  return (

    <form

      className="rounded-[2rem] border border-brand/25 bg-white/95 p-5 shadow-xl shadow-brand/10 backdrop-blur-sm sm:p-8"

      noValidate

      onSubmit={handleSubmit}

    >

      <div className="mb-6 rounded-2xl border border-brand/20 bg-brand-light/50 px-4 py-3 text-sm text-slate-700">

        {introMessage}

      </div>



      <div className="grid gap-5 md:grid-cols-2">

        <div className="md:col-span-2">

          <Input

            defaultValue={product?.title ?? ""}

            error={errors.title}

            label="Titulo"

            name="title"

            placeholder="Titulo descriptivo del producto"

            type="text"

          />

        </div>



        <label className="space-y-2">

          <span className="text-sm font-semibold text-slate-800">Categoria</span>

          <select

            aria-invalid={Boolean(errors.categoryId)}

            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"

            defaultValue={product?.categoryId ?? ""}

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

            <p className="text-xs leading-5 text-red-600">{errors.categoryId}</p>

          ) : null}

        </label>



        <label className="space-y-2">

          <span className="text-sm font-semibold text-slate-800">Condicion</span>

          <select

            aria-invalid={Boolean(errors.condition)}

            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"

            defaultValue={product?.condition ?? ""}

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

          defaultValue={product?.price ?? ""}

          error={errors.price}

          key={`price-${productCurrency}`}

          label={`Precio de venta (${productCurrency})`}

          min="0"

          name="price"

          placeholder={`Precio en ${productCurrency}`}

          step="0.01"

          type="number"

        />

        <Input

          defaultValue={product?.compareAtPrice ?? ""}

          error={errors.compareAtPrice}

          key={`compare-${productCurrency}`}

          label={`Precio de referencia (${productCurrency}, opcional)`}

          min="0"

          name="compareAtPrice"

          placeholder="Solo para ofertas"

          step="0.01"

          type="number"

        />

        <p className="text-xs leading-5 text-slate-500 md:col-span-2">

          Si indicas un precio de referencia mayor al precio de venta, el producto

          se mostrara como en oferta en el marketplace.

        </p>



        <Input

          defaultValue={product?.city ?? ""}

          error={errors.city}

          label="Ciudad"

          name="city"

          placeholder="Ciudad o localidad"

          type="text"

        />



        <ProductCountrySelect

          defaultCountry={defaultCountry}

          error={errors.country}

          onCountryChange={setSelectedCountry}

          selectedCountry={selectedCountry}

        />



        <label className="space-y-2 md:col-span-2">

          <span className="text-sm font-semibold text-slate-800">Descripcion</span>

          <textarea

            aria-invalid={Boolean(errors.description)}

            className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"

            defaultValue={product?.description ?? ""}

            name="description"

            placeholder="Describe el estado, detalles y condiciones del producto."

          />

          {errors.description ? (

            <p className="text-xs leading-5 text-red-600">{errors.description}</p>

          ) : null}

        </label>

      </div>



      {status ? (

        <p

          className={

            status.type === "success"

              ? "mt-6 rounded-2xl bg-brand-light px-4 py-3 text-sm text-brand-dark"

              : "mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"

          }

        >

          {status.message}

        </p>

      ) : null}



      <div className="mt-8 flex flex-col gap-3 sm:flex-row">

        <Button disabled={isLoading} type="submit">

          {isLoading

            ? "Guardando..."

            : isEdit

              ? "Guardar cambios"

              : "Publicar producto"}

        </Button>

        <Link

          className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"

          href={isEdit ? "/cuenta" : "/marketplace"}

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


