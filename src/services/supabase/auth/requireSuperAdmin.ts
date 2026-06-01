import { redirect } from "next/navigation";

import { isSuperAdmin } from "@/lib/auth/roles";
import { getAuthenticatedUser } from "@/services/supabase/auth/getAuthenticatedUser";
import {
  fetchProfileByUserId,
  type SuperAdminSession,
} from "@/services/supabase/auth/getAuthenticatedProfile";
import { createSupabaseServerClient } from "@/services/supabase/server";

export async function requireSuperAdmin(
  nextPath = "/admin",
): Promise<SuperAdminSession> {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const profile = await fetchProfileByUserId(supabase, user.id);
  if (!profile || !isSuperAdmin(profile.role)) {
    redirect("/cuenta");
  }

  return { user, profile };
}
