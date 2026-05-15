import type { AuthError } from "@supabase/supabase-js";

import { supabase } from "@/services/supabase/client";

import type {
  AuthCredentials,
  AuthProvider,
  RegisterCredentials,
} from "../types";

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
  email,
  fullName,
  password,
}: RegisterCredentials) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(DEFAULT_POST_AUTH_PATH),
      data: {
        full_name: fullName,
      },
    },
  });
}

export async function signInWithGoogle() {
  return signInWithOAuth("google");
}

async function signInWithOAuth(provider: AuthProvider) {
  const redirectTo = getAuthCallbackUrl(DEFAULT_POST_AUTH_PATH);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      /**
       * Redirección manual: evita que el flujo se quede colgado si el SDK no
       * llama a `location.assign` (p. ej. detección de entorno en el cliente).
       */
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { data, error };
  }

  if (!data?.url) {
    const synthetic = {
      name: "OAuthNoUrl",
      message:
        "No se pudo iniciar el flujo con Google. Revisa URL de redirección y proveedor en Supabase.",
      status: 400,
    } as AuthError;
    return { data, error: synthetic };
  }

  if (typeof window !== "undefined") {
    window.location.assign(data.url);
  }

  return { data, error: null };
}
