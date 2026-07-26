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

  const { data: sellerProfile, error: sellerProfileError } = await supabase
    .from("profiles")
    .select("whatsapp")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (sellerProfileError) {
    return {
      data: null,
      error: "No pudimos validar tu perfil de vendedor.",
    };
  }

  const whatsappDigits = String(
    (sellerProfile as { whatsapp: string | null } | null)?.whatsapp ?? "",
  ).replace(/\D/g, "");

  if (whatsappDigits.length < 8) {
    return {
      data: null,
      error:
        "Registra tu numero de WhatsApp en tu perfil antes de publicar productos.",
    };
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

      is_on_offer: Boolean(values.isOnOffer),

      stock: values.stock,

      shipping_type: values.shippingType,

      published_at: null,

      specifications: values.specifications ?? [],

      long_description: normalizeNullable(values.longDescription),

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

      is_on_offer: Boolean(values.isOnOffer),

      stock: values.stock,

      shipping_type: values.shippingType,

      specifications: values.specifications ?? [],

      long_description: normalizeNullable(values.longDescription),

    })

    .eq("id", productId)

    .eq("seller_id", userData.user.id);



  if (error) {

    return { error: getProductMutationErrorMessage(error.message) };

  }



  return { error: null };

}

export async function deleteProduct(
  productId: string,
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();

  if (userError || !userData.user) {
    return { error: "Debes iniciar sesion para eliminar el producto." };
  }

  const { data, error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", productId)
    .eq("seller_id", userData.user.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: getProductMutationErrorMessage(error.message) };
  }

  if (!data) {
    return { error: "No encontramos ese producto o ya fue eliminado." };
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



  if (
    normalizedMessage.includes("row-level security") ||
    normalizedMessage.includes("infinite recursion")
  ) {
    return "No tienes permisos para gestionar este producto.";
  }

  if (
    normalizedMessage.includes("relation") &&
    normalizedMessage.includes("does not exist")
  ) {
    return "La gestion de productos aun no esta disponible. Intentalo mas tarde.";
  }



  return "No pudimos guardar el producto. Revisa los datos e intentalo de nuevo.";

}


