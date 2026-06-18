import type { AccountProfileView } from "@/features/account/types";

export type BuyerShippingProfileFields = Readonly<{
  country: string | null;
  shippingCity: string | null;
  shippingAddress: string | null;
  phone: string | null;
}>;

export function hasCompleteBuyerShippingProfile(
  profile: BuyerShippingProfileFields | null | undefined,
): boolean {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.country?.trim() &&
      profile.shippingCity?.trim() &&
      profile.shippingAddress?.trim() &&
      profile.phone?.trim(),
  );
}

export function getMissingBuyerShippingFields(
  profile: BuyerShippingProfileFields | null | undefined,
): ReadonlyArray<string> {
  if (!profile) {
    return ["país", "ciudad", "dirección", "teléfono"];
  }

  const missing: string[] = [];

  if (!profile.country?.trim()) {
    missing.push("país");
  }

  if (!profile.shippingCity?.trim()) {
    missing.push("ciudad");
  }

  if (!profile.shippingAddress?.trim()) {
    missing.push("dirección");
  }

  if (!profile.phone?.trim()) {
    missing.push("teléfono");
  }

  return missing;
}

export function toBuyerShippingFields(
  profile: AccountProfileView,
): BuyerShippingProfileFields {
  return {
    country: profile.country,
    shippingCity: profile.shippingCity,
    shippingAddress: profile.shippingAddress,
    phone: profile.phone,
  };
}
