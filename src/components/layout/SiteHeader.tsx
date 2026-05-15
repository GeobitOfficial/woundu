import { createSupabaseServerClient } from "@/services/supabase/server";

import { SiteHeaderClient } from "./SiteHeaderClient";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return <SiteHeaderClient isLoggedIn={Boolean(data.user)} />;
}
