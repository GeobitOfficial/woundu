import type { SellerPayoutProfile } from "@/features/orders/types";
import {
  buildSellerPayoutProfile,
  type PayoutMethodRow,
  type PayoutProfileRow,
} from "@/features/account/services/payoutMapper";
import { createSupabaseServerClient } from "@/services/supabase/server";

export async function getSellerPayoutProfileForUser(
  userId: string,
): Promise<SellerPayoutProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const [{ data: profileRow }, { data: methodRows }] = await Promise.all([
    supabase
      .from("seller_payout_profiles")
      .select("user_id, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("seller_payout_methods")
      .select(
        "id, user_id, account_type, entity_name, account_number, account_holder, instructions, is_primary, sort_order, updated_at",
      )
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
  ]);

  return buildSellerPayoutProfile(
    userId,
    (profileRow as PayoutProfileRow | null) ?? null,
    (methodRows ?? []) as PayoutMethodRow[],
  );
}

export { sellerHasPayoutMethods } from "@/features/account/services/payoutMapper";
