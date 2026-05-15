import { getCurrentUser, supabase } from "@/services/supabase/client";
import type { CreateProductFormValues } from "@/validations/product";

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
      currency: "USD",
      condition: values.condition,
      status: "active",
      city: normalizeNullable(values.city),
      country: normalizeNullable(values.country),
      compare_at_price:
        values.compareAtPrice != null && Number.isFinite(values.compareAtPrice)
          ? values.compareAtPrice
          : null,
      published_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getCreateProductErrorMessage(error?.message),
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

function getCreateProductErrorMessage(message?: string) {
  if (!message) {
    return "No pudimos publicar el producto. Intentalo de nuevo.";
  }

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("row-level security")) {
    return "No tienes permisos para publicar. Verifica tu sesion y que exista tu perfil.";
  }

  if (normalizedMessage.includes("relation") || normalizedMessage.includes("schema")) {
    return "La publicacion de productos aun no esta disponible. Intentalo mas tarde.";
  }

  return "No pudimos publicar el producto. Revisa los datos e intentalo de nuevo.";
}
