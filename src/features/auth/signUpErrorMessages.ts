import type { AuthError } from "@supabase/supabase-js";

function readErrorCode(error: AuthError): string | undefined {
  if ("code" in error && typeof (error as { code?: unknown }).code === "string") {
    return (error as { code: string }).code;
  }
  return undefined;
}

function normalizeMessage(message: string): string {
  const trimmed = message.trim();
  try {
    const parsed = JSON.parse(trimmed) as { msg?: string; message?: string };
    if (typeof parsed.msg === "string") {
      return parsed.msg;
    }
    if (typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    /* no es JSON */
  }
  return trimmed;
}

/**
 * Convierte errores de Supabase Auth en mensajes comprensibles al registrar cuenta.
 */
export function mapSignUpAuthErrorToUserMessage(error: AuthError): string {
  const code = readErrorCode(error);
  const message = normalizeMessage(error.message);
  const lower = message.toLowerCase();

  switch (code) {
    case "email_exists":
    case "user_already_exists":
    case "identity_already_exists":
      return "Este email ya esta registrado. Prueba iniciar sesion o recuperar contrasena.";
    case "signup_disabled":
      return "El registro esta desactivado en este proyecto (Supabase: Authentication).";
    case "email_provider_disabled":
      return "El acceso con email esta desactivado. Activalo en Supabase: Authentication, proveedor Email.";
    case "validation_failed":
      return "Los datos no son validos. Revisa el email y la contrasena.";
    case "weak_password":
      return "La contrasena no cumple los requisitos de seguridad del servidor.";
    case "captcha_failed":
      return "No se pudo validar el captcha. Intentalo de nuevo.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Demasiados intentos. Espera unos minutos e intentalo de nuevo.";
    case "hook_timeout":
    case "hook_timeout_after_retry":
    case "hook_payload_over_size_limit":
    case "hook_payload_invalid_content_type":
      return "Un hook de Auth en Supabase fallo o tardo demasiado. Revisa Authentication, Hooks (o Edge Functions vinculadas).";
    default:
      break;
  }

  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered") ||
    lower.includes("email address is already") ||
    lower.includes("already exists")
  ) {
    return "Este email ya esta registrado. Prueba iniciar sesion o recuperar contrasena.";
  }

  if (lower.includes("database error") || lower.includes("saving new user")) {
    return "El servidor no pudo crear tu perfil (error al guardar el usuario). Si administras Supabase, revisa el trigger on_auth_user_created y la tabla public.profiles.";
  }

  if (lower.includes("password")) {
    return "La contrasena no cumple los requisitos de seguridad.";
  }

  if (lower.includes("invalid") && lower.includes("email")) {
    return "El formato del email no es valido.";
  }

  if (
    lower.includes("fetch") ||
    lower.includes("network") ||
    lower.includes("failed to fetch") ||
    lower.includes("load failed")
  ) {
    return "No hay conexion o Supabase no responde. Comprueba tu red y NEXT_PUBLIC_SUPABASE_URL.";
  }

  const devHint =
    process.env.NODE_ENV === "development"
      ? ` Detalle tecnico: ${message}`
      : "";

  return `No pudimos crear la cuenta. Revisa tus datos e intentalo de nuevo.${devHint}`;
}
