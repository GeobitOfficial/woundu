import type { RegisterFormValues } from "@/validations/auth";

type RegisterEdgeResponse = {
  error?: string;
  ok?: boolean;
};

export async function registerUserViaEdgeFunction(
  values: RegisterFormValues & { currency: string },
): Promise<{ error: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return {
      error: "Faltan variables de Supabase en el servidor.",
    };
  }

  let response: Response;

  try {
    response = await fetch(`${supabaseUrl}/functions/v1/register-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      cache: "no-store",
    });
  } catch {
    return {
      error:
        "No pudimos contactar el servicio de registro. Revisa tu conexión e inténtalo de nuevo.",
    };
  }

  let payload: RegisterEdgeResponse = {};

  try {
    payload = (await response.json()) as RegisterEdgeResponse;
  } catch {
    return {
      error: "Respuesta invalida del servicio de registro.",
    };
  }

  if (!response.ok) {
    return {
      error: payload.error ?? "No pudimos crear la cuenta. Inténtalo de nuevo.",
    };
  }

  return { error: null };
}
