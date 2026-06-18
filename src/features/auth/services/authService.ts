import { supabase } from "@/services/supabase/client";

import type { AuthCredentials, RegisterCredentials } from "../types";

const DEFAULT_POST_AUTH_PATH = "/cuenta";

function getAuthCallbackUrl(nextPath: string = DEFAULT_POST_AUTH_PATH) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const path = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(path)}`;
}

export async function signInWithEmail({ email, password }: AuthCredentials) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail({
  country,
  currency,
  email,
  fullName,
  password,
  role,
}: RegisterCredentials) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(DEFAULT_POST_AUTH_PATH),
      data: {
        full_name: fullName,
        country,
        currency,
        role,
      },
    },
  });
}
