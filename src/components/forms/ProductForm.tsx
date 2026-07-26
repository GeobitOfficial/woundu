"use client";



import Link from "next/link";

import { useRouter } from "next/navigation";

import { useMemo, useState, type FormEvent } from "react";

import { ZodError } from "zod";



import { ProductCountrySelect,
  useProductCountryCurrency,
} from "@/components/forms/ProductCountrySelect";
import { ProductImageUpload } from "@/components/forms/ProductImageUpload";

import { formatCurrencyLabel } from "@/constants/countryCurrencies";

import { Button, Input } from "@/components/ui";

import {

  createProduct,

  updateProduct,

} from "@/features/products/services/productMutations";
import {
  uploadProductImages,
  type ProductImageRecord,
} from "@/features/products/services/productImageMutations";

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

  existingImages?: ReadonlyArray<ProductImageRecord>;

}>;



export function ProductForm({

  categories,

  mode = "create",

  product,

  existingImages = [],

  sellerLocale,

}: ProductFormProps) {

  const router = useRouter();

  const isEdit = mode === "edit" && product != null;

  const defaultCountry =

    product?.country ?? sellerLocale?.country ?? "";



  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [shippingType, setShippingType] = useState<"free" | "paid">(
    product?.shippingType ?? "free",
  );
  const [isOnOffer, setIsOnOffer] = useState<boolean>(product?.isOnOffer ?? false);

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<FormStatus | null>(null);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(product?.categoryId ?? "");

  const initialSpecs = useMemo(() => {
    if (product?.specifications && Array.isArray(product.specifications)) {
      return product.specifications.map((spec: any) => ({
        key: String(spec.key || ""),
        value: String(spec.value || ""),
      }));
    }
    return [];
  }, [product?.specifications]);

  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>(initialSpecs);

  const CATEGORY_SPEC_PRESETS: Record<string, string[]> = {
    tecnologia: ["Marca", "Modelo", "Memoria RAM", "Almacenamiento", "Procesador", "Sistema Operativo"],
    hogar: ["Marca", "Modelo", "Material", "Dimensiones", "Color"],
    moda: ["Marca", "Talla", "Material", "Género", "Color"],
    servicios: ["Tipo de servicio", "Modalidad (Online/Presencial)", "Duración", "Experiencia requerida"],
    default: ["Marca", "Modelo"],
  };



  const productCurrency = useProductCountryCurrency(selectedCountry);

  const currencyLabel = formatCurrencyLabel(productCurrency);



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const formData = new FormData(event.currentTarget);



    const payload = {

      title: String(formData.get("title") ?? ""),

      description: String(formData.get("description") ?? ""),

      longDescription: String(formData.get("longDescription") ?? ""),

      price: String(formData.get("price") ?? ""),

      isOnOffer,

      compareAtPrice: String(formData.get("compareAtPrice") ?? ""),

      stock: String(formData.get("stock") ?? ""),

      categoryId: String(formData.get("categoryId") ?? ""),

      condition: String(formData.get("condition") ?? ""),

      city: String(formData.get("city") ?? ""),

      country: selectedCountry || String(formData.get("country") ?? ""),

      shippingType,

      specifications: specifications.filter(
        (spec) => spec.key.trim() !== "" && spec.value.trim() !== ""
      ),

    };



    try {

      setErrors({});

      setStatus(null);

      const hasImages = isEdit
        ? (existingImages.length > 0 || selectedImages.length > 0)
        : selectedImages.length > 0;

      if (!hasImages) {
        setStatus({
          type: "error",
          message: "Debes subir al menos una foto para tu producto.",
        });
        return;
      }

      setIsLoading(true);



      if (isEdit) {

        const values = updateProductSchema.parse(payload);

        const { error } = await updateProduct(product.id, values);



        if (error) {

          setStatus({ type: "error", message: error });

          return;

        }

        if (selectedImages.length > 0) {
          const uploadResult = await uploadProductImages(product.id, selectedImages);
          if (uploadResult.error) {
            setStatus({ type: "error", message: uploadResult.error });
            return;
          }
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

      const { data, error } = await createProduct(values);



      if (error) {

        setStatus({ type: "error", message: error });

        return;

      }

      if (data && selectedImages.length > 0) {
        const uploadResult = await uploadProductImages(data.id, selectedImages);
        if (uploadResult.error) {
          setStatus({ type: "error", message: uploadResult.error });
          return;
        }
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

            value={selectedCategory}

            name="categoryId"

            onChange={(e) => {
              const catId = e.target.value;
              setSelectedCategory(catId);
              const category = categories.find((cat) => cat.id === catId);
              if (category) {
                const slug = category.slug.toLowerCase();
                const presets = CATEGORY_SPEC_PRESETS[slug] || CATEGORY_SPEC_PRESETS.default;
                setSpecifications(presets.map((key) => ({ key, value: "" })));
              } else {
                setSpecifications([]);
              }
            }}

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

        <div className="space-y-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <input
              checked={isOnOffer}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              name="isOnOffer"
              onChange={(event) => setIsOnOffer(event.target.checked)}
              type="checkbox"
              value="true"
            />
            <span className="text-sm font-semibold text-slate-900">
              Vender en oferta
            </span>
          </label>
          <p className="text-sm leading-5 text-slate-500">
            Activa esto para mostrar el producto como oferta en el marketplace.
          </p>
        </div>

        {isOnOffer ? (
          <Input

            defaultValue={product?.compareAtPrice ?? ""}

            error={errors.compareAtPrice}

            key={`compare-${productCurrency}`}

            label={`Precio de referencia (${productCurrency})`}

            min="0"

            name="compareAtPrice"

            placeholder="Precio antes de la oferta"

            step="0.01"

            type="number"

          />
        ) : null}

        <Input

          defaultValue={product?.stock ?? 1}

          error={errors.stock}

          label="Stock disponible"

          min="1"

          name="stock"

          placeholder="Cantidad en venta"

          step="1"

          type="number"

        />

        <fieldset className="space-y-3 md:col-span-2">
          <legend className="text-sm font-semibold text-slate-800">
            Tipo de envio
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 has-[:checked]:border-brand has-[:checked]:bg-brand-light/20">
              <input
                checked={shippingType === "free"}
                className="mt-1"
                name="shippingType"
                onChange={() => setShippingType("free")}
                type="radio"
                value="free"
              />
              <span>
                <span className="block text-sm font-bold text-slate-900">
                  Envio gratis
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  El precio publicado incluye el envio acordado contigo.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 has-[:checked]:border-brand has-[:checked]:bg-brand-light/20">
              <input
                checked={shippingType === "paid"}
                className="mt-1"
                name="shippingType"
                onChange={() => setShippingType("paid")}
                type="radio"
                value="paid"
              />
              <span>
                <span className="block text-sm font-bold text-slate-900">
                  Envio pagado
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  El comprador vera que el envio se negocia aparte segun su
                  ubicacion.
                </span>
              </span>
            </label>
          </div>
          {errors.shippingType ? (
            <p className="text-xs leading-5 text-red-600">{errors.shippingType}</p>
          ) : null}
        </fieldset>

        <p className="text-xs leading-5 text-slate-500 md:col-span-2">

          Si indicas un precio de referencia mayor al precio de venta, el producto

          se mostrara como en oferta en el marketplace. El stock indica cuantas

          unidades quedan disponibles para los compradores.

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



        {/* ESPECIFICACIONES DINÁMICAS */}
        <div className="md:col-span-2 space-y-4 border-t border-slate-100 pt-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Especificaciones detalladas
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Agrega detalles técnicos del producto (ej: Marca, Modelo, Capacidad) para ayudar a los compradores.
            </p>
          </div>

          <div className="space-y-3">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Característica (ej: Marca)"
                  value={spec.key}
                  onChange={(e) => {
                    const newSpecs = [...specifications];
                    newSpecs[index].key = e.target.value;
                    setSpecifications(newSpecs);
                  }}
                  className="h-11 w-1/3 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                />
                <input
                  type="text"
                  placeholder="Valor (ej: Intel Core 5)"
                  value={spec.value}
                  onChange={(e) => {
                    const newSpecs = [...specifications];
                    newSpecs[index].value = e.target.value;
                    setSpecifications(newSpecs);
                  }}
                  className="h-11 w-2/3 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSpecifications(specifications.filter((_, i) => i !== index));
                  }}
                  className="rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 p-2.5 transition shrink-0"
                  title="Eliminar fila"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                setSpecifications([...specifications, { key: "", value: "" }]);
              }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-brand bg-brand/5 hover:bg-brand/10 text-brand px-4 py-2 text-xs font-bold transition shadow-sm"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Agregar característica
            </button>
          </div>
        </div>

        <label className="space-y-2 md:col-span-2">

          <span className="text-sm font-semibold text-slate-800">Descripción corta</span>

          <textarea

            aria-invalid={Boolean(errors.description)}

            className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"

            defaultValue={product?.description ?? ""}

            name="description"

            placeholder="Describe brevemente el producto (se muestra en la parte superior al lado de las fotos)."

          />

          {errors.description ? (

            <p className="text-xs leading-5 text-red-600">{errors.description}</p>

          ) : null}

        </label>

        <label className="space-y-2 md:col-span-2">

          <span className="text-sm font-semibold text-slate-800">Descripción detallada (larga)</span>

          <textarea

            aria-invalid={Boolean(errors.longDescription)}

            className="min-h-56 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"

            defaultValue={product?.longDescription ?? ""}

            name="longDescription"

            placeholder="Escribe la descripción larga y detallada del producto (se muestra al final de la página)."

          />

          {errors.longDescription ? (

            <p className="text-xs leading-5 text-red-600">{errors.longDescription}</p>

          ) : null}

        </label>

        <ProductImageUpload
          existingImages={existingImages}
          onFilesChange={setSelectedImages}
          selectedFiles={selectedImages}
        />

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

      field === "longDescription" ||

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


