import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserNotification } from "@/features/notifications/types";
import { createSupabaseServerClient } from "@/services/supabase/server";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

function mapNotification(row: NotificationRow): UserNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

async function fetchNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit: number,
): Promise<ReadonlyArray<UserNotification>> {
  const { data, error } = await supabase
    .from("user_notifications")
    .select("id, type, title, body, href, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as NotificationRow[]).map(mapNotification);
}

export async function getRecentNotificationsForUser(
  userId: string,
  limit = 8,
): Promise<ReadonlyArray<UserNotification>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  return fetchNotifications(supabase, userId, limit);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("user_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error || count == null) {
    return 0;
  }

  return count;
}

export async function getAllNotificationsForUser(
  userId: string,
  limit = 50,
): Promise<ReadonlyArray<UserNotification>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  return fetchNotifications(supabase, userId, limit);
}
