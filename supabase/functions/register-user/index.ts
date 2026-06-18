import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type RegisterPayload = {
  country?: string;
  currency?: string;
  email?: string;
  fullName?: string;
  password?: string;
  role?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeEmail(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function mapCreateUserError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("already") ||
    lower.includes("exists") ||
    lower.includes("registered")
  ) {
    return "Este email ya está registrado. Prueba iniciar sesión.";
  }

  if (lower.includes("password")) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }

  if (lower.includes("invalid") && lower.includes("email")) {
    return "Ingresa un email válido.";
  }

  return "No pudimos crear la cuenta. Inténtalo de nuevo.";
}

function validatePayload(body: RegisterPayload): {
  error: string | null;
  values: RegisterPayload | null;
} {
  const email = normalizeEmail(String(body.email ?? ""));
  const password = String(body.password ?? "");
  const fullName = String(body.fullName ?? "").trim();
  const country = String(body.country ?? "").trim();
  const currency = String(body.currency ?? "").trim();
  const role = body.role;

  if (!fullName || fullName.length < 2) {
    return { error: "Ingresa tu nombre completo.", values: null };
  }

  if (!isValidEmail(email)) {
    return { error: "Ingresa un email valido.", values: null };
  }

  if (password.length < 8) {
    return {
      error: "La contrasena debe tener al menos 8 caracteres.",
      values: null,
    };
  }

  if (!country) {
    return { error: "Selecciona tu pais.", values: null };
  }

  if (!currency) {
    return { error: "No encontramos la moneda para ese país.", values: null };
  }

  if (role !== "buyer" && role !== "seller") {
    return {
      error: "Selecciona si usarás Woundu como comprador o vendedor.",
      values: null,
    };
  }

  return {
    error: null,
    values: {
      email,
      password,
      fullName,
      country,
      currency,
      role,
    },
  };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: RegisterPayload;

  try {
    body = (await request.json()) as RegisterPayload;
  } catch {
    return jsonResponse({ error: "Solicitud invalida." }, 400);
  }

  const { error: validationError, values } = validatePayload(body);

  if (validationError || !values) {
    return jsonResponse({ error: validationError }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Registro no disponible." }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await admin.auth.admin.createUser({
    email: values.email!,
    password: values.password!,
    email_confirm: true,
    user_metadata: {
      full_name: values.fullName,
      country: values.country,
      currency: values.currency,
      role: values.role,
    },
  });

  if (error) {
    return jsonResponse({ error: mapCreateUserError(error.message) }, 400);
  }

  return jsonResponse({ ok: true });
});
