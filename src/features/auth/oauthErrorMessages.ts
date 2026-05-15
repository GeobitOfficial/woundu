function normalizeAuthErrorText(raw: string): string {
  const trimmed = raw.trim();
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
 * Mensajes claros para errores de OAuth devueltos por Supabase Auth.
 */
export function mapOAuthProviderErrorToUserMessage(message: string): string | null {
  const normalized = normalizeAuthErrorText(message).toLowerCase();

  if (
    normalized.includes("provider is not enabled") ||
    normalized.includes("unsupported provider")
  ) {
    return "Google no está activado en tu proyecto de Supabase. En el panel: Authentication → Providers → Google: actívalo y configura Client ID y Client Secret (desde Google Cloud Console → APIs y servicios → Credenciales → OAuth 2.0).";
  }

  return null;
}

export function getGoogleSignInFallbackMessage(message: string): string {
  return (
    mapOAuthProviderErrorToUserMessage(message) ??
    "No pudimos conectar con Google. Intentalo de nuevo o usa email y contraseña."
  );
}
