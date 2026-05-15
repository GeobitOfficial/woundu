"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase } from "@/services/supabase/client";

/**
 * Un solo intercambio por código: en desarrollo, React Strict Mode ejecuta
 * los efectos dos veces; el código de OAuth es de un solo uso y el segundo
 * intento devuelve "Unable to exchange external code".
 */
const inflightCodeExchanges = new Map<
  string,
  ReturnType<typeof supabase.auth.exchangeCodeForSession>
>();

function exchangeCodeForSessionOnce(code: string) {
  let pending = inflightCodeExchanges.get(code);
  if (!pending) {
    pending = supabase.auth.exchangeCodeForSession(code).finally(() => {
      inflightCodeExchanges.delete(code);
    });
    inflightCodeExchanges.set(code, pending);
  }
  return pending;
}

function redirectToLogin(
  router: ReturnType<typeof useRouter>,
  code: string,
  description: string,
) {
  const params = new URLSearchParams();
  params.set("error", "oauth");
  params.set("error_code", code);
  params.set("error_description", description);
  router.replace(`/login?${params.toString()}`);
}

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completando inicio de sesión...");

  useEffect(() => {
    async function run() {
      const providerError = searchParams.get("error");
      const providerDesc = searchParams.get("error_description");
      const code = searchParams.get("code");
      const nextRaw = searchParams.get("next") ?? "/cuenta";
      const next = nextRaw.startsWith("/") ? nextRaw : "/cuenta";

      if (providerError) {
        redirectToLogin(
          router,
          providerError,
          providerDesc ?? providerError,
        );
        return;
      }

      if (!code) {
        redirectToLogin(
          router,
          "missing_code",
          "El proveedor no envió un código de autenticación.",
        );
        return;
      }

      const { error } = await exchangeCodeForSessionOnce(code);

      if (!error) {
        setMessage("Sesión lista. Redirigiendo…");
        router.replace(next);
        router.refresh();
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      redirectToLogin(router, "exchange_failed", error.message);
    }

    void run().catch(() => {
      redirectToLogin(
        router,
        "exchange_failed",
        "Error inesperado al intercambiar el código.",
      );
    });
  }, [router, searchParams]);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
          Cargando...
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
