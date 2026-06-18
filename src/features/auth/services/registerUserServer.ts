import { getCurrencyForCountryName } from "@/constants/countryCurrencies";
import { registerUserViaEdgeFunction } from "@/features/auth/services/registerUserEdge";
import { createSupabaseAdminClient } from "@/services/supabase/admin";
import { registerSchema, type RegisterFormValues } from "@/validations/auth";

function mapAdminCreateUserError(message: string): string {
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

export async function registerUserOnServer(
  values: RegisterFormValues,
): Promise<{ error: string | null }> {
  const parsed = registerSchema.parse(values);
  const currency = getCurrencyForCountryName(parsed.country);

  if (!currency) {
    return { error: "No encontramos la moneda para ese país." };
  }

  const payload = { ...parsed, currency };
  const admin = createSupabaseAdminClient();

  if (admin) {
    const { error } = await admin.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.fullName,
        country: parsed.country,
        currency,
        role: parsed.role,
      },
    });

    if (error) {
      return { error: mapAdminCreateUserError(error.message) };
    }

    return { error: null };
  }

  return registerUserViaEdgeFunction(payload);
}
