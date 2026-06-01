import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { cache } from "react";

/**
 * Evita que una petición a Supabase bloquee el renderizado del servidor cuando
 * el backend no responde (proyecto pausado, red caída, etc.). Si se supera el
 * tiempo límite, la consulta falla rápido y la página se muestra al instante
 * con estado vacío en lugar de esperar el timeout largo del fetch nativo.
 */
const SUPABASE_FETCH_TIMEOUT_MS = 4000;

const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    SUPABASE_FETCH_TIMEOUT_MS,
  );

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
};

export const createSupabaseServerClient = cache(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: fetchWithTimeout,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components no pueden escribir cookies; el middleware refresca la sesión.
        }
      },
    },
  });
});
