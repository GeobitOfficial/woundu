import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import type { UserRole } from "@/types";

import { createSupabaseServerClient } from "../server";

export type AuthenticatedProfile = Readonly<{
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
}>;

export const getAuthenticatedProfile = cache(
  async (): Promise<AuthenticatedProfile | null> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return null;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const profile = await fetchProfileByUserId(supabase, user.id);
    return profile;
  },
);

export async function fetchProfileByUserId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
): Promise<AuthenticatedProfile | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, deleted_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data || data.deleted_at != null) {
    return null;
  }

  return {
    id: data.id,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    role: data.role as UserRole,
  };
}

export type SuperAdminSession = Readonly<{
  user: User;
  profile: AuthenticatedProfile;
}>;
