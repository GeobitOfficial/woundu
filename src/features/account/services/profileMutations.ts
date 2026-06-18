import { getCurrentUser, supabase } from "@/services/supabase/client";
import {
  getCurrencyForCountryName,
  isLatinAmericaCountry,
} from "@/constants/countryCurrencies";
import type { UpdateProfileFormValues } from "@/validations/profile";

export async function updateProfile(
  values: UpdateProfileFormValues,
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();

  if (userError || !userData.user) {
    return { error: "Debes iniciar sesion para actualizar tu perfil." };
  }

  if (!isLatinAmericaCountry(values.country)) {
    return { error: "Selecciona un pais valido de Latinoamerica." };
  }

  const currency = getCurrencyForCountryName(values.country);
  if (!currency) {
    return { error: "No encontramos la moneda para ese pais." };
  }

  const payload: Record<string, string | null> = {
    full_name: values.fullName,
    username: values.username ?? null,
    bio: values.bio ?? null,
    country: values.country,
    currency,
  };

  if ("shippingCity" in values) {
    payload.shipping_city = values.shippingCity;
    payload.shipping_address = values.shippingAddress;
    payload.phone = values.phone;
  }

  if ("whatsapp" in values) {
    payload.whatsapp = values.whatsapp.replace(/\D/g, "");
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userData.user.id);

  if (error) {
    return { error: mapProfileUpdateError(error.message) };
  }

  return { error: null };
}

function mapProfileUpdateError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("duplicate") || normalized.includes("unique")) {
    return "Ese nombre de usuario ya esta en uso. Prueba otro.";
  }
  return "No pudimos guardar los cambios. Intentalo de nuevo.";
}
