import { getCurrentUser, supabase } from "@/services/supabase/client";
import type { Category } from "@/types";
import type { CategoryFormValues } from "@/validations/category";

type CategoryMutationResult = Readonly<{
  data: Category | null;
  error: string | null;
}>;

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureSuperAdminSession() {
  const { data, error } = await getCurrentUser();
  if (error || !data.user) {
    return {
      ok: false as const,
      error: "Debes iniciar sesión como Super Admin.",
    };
  }

  return { ok: true as const, userId: data.user.id };
}

export async function createCategory(
  values: CategoryFormValues,
): Promise<CategoryMutationResult> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: values.name,
      slug: values.slug,
      description: values.description?.trim() ? values.description.trim() : null,
      icon: values.icon,
      sort_order: values.sortOrder,
      is_active: values.isActive,
    })
    .select(
      "id, name, slug, description, icon, sort_order, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getCategoryMutationErrorMessage(error?.message),
    };
  }

  return { data: mapCategory(data as CategoryRow), error: null };
}

export async function updateCategory(
  categoryId: string,
  values: CategoryFormValues,
): Promise<CategoryMutationResult> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("categories")
    .update({
      name: values.name,
      slug: values.slug,
      description: values.description?.trim() ? values.description.trim() : null,
      icon: values.icon,
      sort_order: values.sortOrder,
      is_active: values.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .select(
      "id, name, slug, description, icon, sort_order, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getCategoryMutationErrorMessage(error?.message),
    };
  }

  return { data: mapCategory(data as CategoryRow), error: null };
}

export async function toggleCategoryActive(
  categoryId: string,
  isActive: boolean,
): Promise<CategoryMutationResult> {
  const session = await ensureSuperAdminSession();
  if (!session.ok) {
    return { data: null, error: session.error };
  }

  const { data, error } = await supabase
    .from("categories")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .select(
      "id, name, slug, description, icon, sort_order, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return {
      data: null,
      error: getCategoryMutationErrorMessage(error?.message),
    };
  }

  return { data: mapCategory(data as CategoryRow), error: null };
}

function getCategoryMutationErrorMessage(message?: string) {
  if (!message) {
    return "No pudimos guardar la categoría. Inténtalo de nuevo.";
  }

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("duplicate key") || normalizedMessage.includes("unique")) {
    return "Ya existe una categoría con ese slug. Usa otro identificador.";
  }

  if (normalizedMessage.includes("row-level security")) {
    return "No tienes permisos de Super Admin para gestionar categorías.";
  }

  return "No pudimos guardar la categoría. Revisa los datos e inténtalo de nuevo.";
}
