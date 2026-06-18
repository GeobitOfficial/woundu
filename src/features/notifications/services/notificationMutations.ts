import { getCurrentUser, supabase } from "@/services/supabase/client";

export async function markNotificationRead(
  notificationId: string,
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();
  if (userError || !userData.user) {
    return { error: "Debes iniciar sesión." };
  }

  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userData.user.id)
    .is("read_at", null);

  if (error) {
    return { error: "No pudimos marcar la notificación." };
  }

  return { error: null };
}

export async function markAllNotificationsRead(): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();
  if (userError || !userData.user) {
    return { error: "Debes iniciar sesión." };
  }

  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userData.user.id)
    .is("read_at", null);

  if (error) {
    return { error: "No pudimos marcar las notificaciones." };
  }

  return { error: null };
}
