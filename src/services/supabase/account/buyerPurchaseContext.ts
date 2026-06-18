import type { SupabaseClient } from "@supabase/supabase-js";

import { hasCompleteBuyerShippingProfile } from "@/lib/account/buyerShippingProfile";
import { canAccessBuyerFeatures } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

type BuyerPurchaseContextRow = {
  role: UserRole;
  country: string | null;
  shipping_city: string | null;
  shipping_address: string | null;
  phone: string | null;
};

export type BuyerPurchaseContext = Readonly<{
  isBuyer: boolean;
  shippingComplete: boolean;
}>;

const BUYER_PURCHASE_SELECT =
  "role, country, shipping_city, shipping_address, phone";

export async function getBuyerPurchaseContext(
  supabase: SupabaseClient,
  userId: string | null | undefined,
): Promise<BuyerPurchaseContext> {
  if (!userId) {
    return { isBuyer: false, shippingComplete: false };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(BUYER_PURCHASE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return { isBuyer: false, shippingComplete: false };
  }

  const row = data as BuyerPurchaseContextRow;
  const isBuyer = canAccessBuyerFeatures(row.role);

  return {
    isBuyer,
    shippingComplete: isBuyer
      ? hasCompleteBuyerShippingProfile({
          country: row.country,
          shippingCity: row.shipping_city,
          shippingAddress: row.shipping_address,
          phone: row.phone,
        })
      : false,
  };
}

export async function getSellerWhatsapp(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("whatsapp")
    .eq("id", sellerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const whatsapp = (data as { whatsapp: string | null }).whatsapp;
  return whatsapp?.trim() ? whatsapp.trim() : null;
}

export async function sellerHasWhatsappConfigured(
  supabase: SupabaseClient,
  sellerId: string,
): Promise<boolean> {
  const whatsapp = await getSellerWhatsapp(supabase, sellerId);
  return Boolean(whatsapp && whatsapp.replace(/\D/g, "").length >= 8);
}
