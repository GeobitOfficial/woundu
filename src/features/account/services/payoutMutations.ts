import { getCurrentUser, supabase } from "@/services/supabase/client";
import {
  buildSellerPayoutProfile,
  type PayoutMethodRow,
  type PayoutProfileRow,
} from "@/features/account/services/payoutMapper";
import type { SellerPayoutProfile } from "@/features/orders/types";
import type { SellerPayoutSettingsFormValues } from "@/validations/payout";

const METHOD_SELECT =
  "id, user_id, account_type, entity_name, account_number, account_holder, instructions, is_primary, sort_order, updated_at";

function normalizePrimaryIndex(methods: SellerPayoutSettingsFormValues["methods"]): number {
  const explicitPrimary = methods.findIndex((method) => method.isPrimary);

  if (explicitPrimary >= 0) {
    return explicitPrimary;
  }

  return 0;
}

async function fetchOwnPayoutProfile(userId: string): Promise<SellerPayoutProfile | null> {
  const [{ data: profileRow }, { data: methodRows }] = await Promise.all([
    supabase
      .from("seller_payout_profiles")
      .select("user_id, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("seller_payout_methods")
      .select(METHOD_SELECT)
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
  ]);

  return buildSellerPayoutProfile(
    userId,
    (profileRow as PayoutProfileRow | null) ?? null,
    (methodRows ?? []) as PayoutMethodRow[],
  );
}

export async function getOwnSellerPayoutProfile(): Promise<{
  data: SellerPayoutProfile | null;
  error: string | null;
}> {
  const { data: userData, error: userError } = await getCurrentUser();
  if (userError || !userData.user) {
    return { data: null, error: "Debes iniciar sesión." };
  }

  const profile = await fetchOwnPayoutProfile(userData.user.id);
  return { data: profile, error: null };
}

export async function saveSellerPayoutSettings(
  values: SellerPayoutSettingsFormValues,
): Promise<{ data: SellerPayoutProfile | null; error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();
  if (userError || !userData.user) {
    return { data: null, error: "Debes iniciar sesión." };
  }

  const userId = userData.user.id;
  const primaryIndex = normalizePrimaryIndex(values.methods);

  const { error: profileError } = await supabase.from("seller_payout_profiles").upsert(
    {
      user_id: userId,
      payment_instructions: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    return { data: null, error: "No pudimos guardar tus instrucciones de cobro." };
  }

  const { error: deleteError } = await supabase
    .from("seller_payout_methods")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return { data: null, error: "No pudimos actualizar tus métodos de cobro." };
  }

  const payload = values.methods.map((method, index) => ({
    user_id: userId,
    account_type: method.accountType,
    entity_name: method.entityName.trim(),
    account_number: method.accountNumber.trim(),
    account_holder: method.accountHolder.trim(),
    instructions: method.instructions?.trim() ? method.instructions.trim() : null,
    is_primary: index === primaryIndex,
    sort_order: index,
  }));

  const { error: insertError } = await supabase
    .from("seller_payout_methods")
    .insert(payload);

  if (insertError) {
    return { data: null, error: "No pudimos guardar tus métodos de cobro." };
  }

  const profile = await fetchOwnPayoutProfile(userId);
  return { data: profile, error: null };
}
