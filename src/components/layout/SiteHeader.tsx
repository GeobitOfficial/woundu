import { createSupabaseServerClient } from "@/services/supabase/server";

import { SiteHeaderClient } from "./SiteHeaderClient";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  let isLoggedIn = false;

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    isLoggedIn = Boolean(data.user);
  }

  return <SiteHeaderClient isLoggedIn={isLoggedIn} />;
}
