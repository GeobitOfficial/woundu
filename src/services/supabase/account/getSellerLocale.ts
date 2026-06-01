import type { SupabaseClient } from "@supabase/supabase-js";

export type SellerLocale = Readonly<{
  country: string | null;
  currency: string;
}>;

export async function getSellerLocale(
  supabase: SupabaseClient,
  userId: string,
): Promise<SellerLocale> {
  const { data, error } = await supabase
    .from("profiles")
    .select("country, currency")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return { country: null, currency: "USD" };
  }

  return {
    country: data.country?.trim() ? data.country.trim() : null,
    currency: data.currency?.trim() ? data.currency.trim() : "USD",
  };
}
