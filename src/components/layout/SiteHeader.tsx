import { getAuthenticatedProfile } from "@/services/supabase/auth/getAuthenticatedProfile";
import { getAuthenticatedUser } from "@/services/supabase/auth/getAuthenticatedUser";
import { isSuperAdmin } from "@/lib/auth/roles";

import { SiteHeaderClient } from "./SiteHeaderClient";

export async function SiteHeader() {
  const user = await getAuthenticatedUser();
  const profile = user ? await getAuthenticatedProfile() : null;

  return (
    <SiteHeaderClient
      isLoggedIn={Boolean(user)}
      isSuperAdmin={isSuperAdmin(profile?.role)}
    />
  );
}