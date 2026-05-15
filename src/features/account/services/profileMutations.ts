import { getCurrentUser, supabase } from "@/services/supabase/client";
import type { UpdateProfileFormValues } from "@/validations/profile";

export async function updateProfile(
  values: UpdateProfileFormValues,
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();

  if (userError || !userData.user) {
    return { error: "Debes iniciar sesion para actualizar tu perfil." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.fullName,
      username: values.username ?? null,
      bio: values.bio ?? null,
    })
    .eq("id", userData.user.id);

  if (error) {
    return { error: mapProfileUpdateError(error.message) };
  }

  return { error: null };
}

function mapProfileUpdateError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("duplicate") || normalized.includes("unique")) {
    return "Ese nombre de usuario ya esta en uso. Prueba otro.";
  }
  return "No pudimos guardar los cambios. Intentalo de nuevo.";
}
