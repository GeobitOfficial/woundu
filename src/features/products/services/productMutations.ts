import { getCurrentUser, supabase } from "@/services/supabase/client";

import { getCurrencyForCountryName } from "@/constants/countryCurrencies";

import type {

  CreateProductFormValues,

  UpdateProductFormValues,

} from "@/validations/product";



type CreateProductResult = Readonly<{

  id: string;

  slug: string;

}>;



export async function createProduct(

  values: CreateProductFormValues,

): Promise<{ data: CreateProductResult | null; error: string | null }> {

  const { data: userData, error: userError } = await getCurrentUser();



  if (userError || !userData.user) {

    return {

      data: null,

      error: "Debes iniciar sesion para publicar un producto.",

    };

  }



  const country = normalizeNullable(values.country);

  if (!country) {

    return { data: null, error: "Selecciona el pais del producto." };

  }



  const currency = getCurrencyForCountryName(country);

  if (!currency) {

    return { data: null, error: "No encontramos la moneda para ese pais." };

  }



  const slug = `${slugify(values.title)}-${crypto.randomUUID().slice(0, 8)}`;



  const { data, error } = await supabase

    .from("products")

    .insert({

      seller_id: userData.user.id,

      category_id: values.categoryId,

      title: values.title,

      slug,

      description: values.description,

      price: values.price,

      currency,

      condition: values.condition,

      status: "pending_review",

      city: normalizeNullable(values.city),

      country,

      compare_at_price:

        values.compareAtPrice != null && Number.isFinite(values.compareAtPrice)

          ? values.compareAtPrice

          : null,

      published_at: null,

    })

    .select("id, slug")

    .single();



  if (error || !data) {

    return {

      data: null,

      error: getProductMutationErrorMessage(error?.message),

    };

  }



  return {

    data: {

      id: String(data.id),

      slug: String(data.slug),

    },

    error: null,

  };

}



export async function updateProduct(

  productId: string,

  values: UpdateProductFormValues,

): Promise<{ error: string | null }> {

  const { data: userData, error: userError } = await getCurrentUser();



  if (userError || !userData.user) {

    return { error: "Debes iniciar sesion para editar el producto." };

  }



  const country = normalizeNullable(values.country);

  if (!country) {

    return { error: "Selecciona el pais del producto." };

  }



  const currency = getCurrencyForCountryName(country);

  if (!currency) {

    return { error: "No encontramos la moneda para ese pais." };

  }



  const { error } = await supabase

    .from("products")

    .update({

      category_id: values.categoryId,

      title: values.title,

      description: values.description,

      price: values.price,

      currency,

      country,

      condition: values.condition,

      city: normalizeNullable(values.city),

      compare_at_price:

        values.compareAtPrice != null && Number.isFinite(values.compareAtPrice)

          ? values.compareAtPrice

          : null,

    })

    .eq("id", productId)

    .eq("seller_id", userData.user.id);



  if (error) {

    return { error: getProductMutationErrorMessage(error.message) };

  }



  return { error: null };

}



function slugify(value: string) {

  return value

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .toLowerCase()

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/^-+|-+$/g, "")

    .slice(0, 80);

}



function normalizeNullable(value?: string) {

  const normalizedValue = value?.trim();



  return normalizedValue ? normalizedValue : null;

}



function getProductMutationErrorMessage(message?: string) {

  if (!message) {

    return "No pudimos guardar el producto. Intentalo de nuevo.";

  }



  const normalizedMessage = message.toLowerCase();



  if (normalizedMessage.includes("row-level security")) {

    return "No tienes permisos para gestionar este producto.";

  }



  if (normalizedMessage.includes("relation") || normalizedMessage.includes("schema")) {

    return "La gestion de productos aun no esta disponible. Intentalo mas tarde.";

  }



  return "No pudimos guardar el producto. Revisa los datos e intentalo de nuevo.";

}


