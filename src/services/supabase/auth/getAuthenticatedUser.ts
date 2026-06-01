import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { createSupabaseServerClient } from "@/services/supabase/server";

export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});
