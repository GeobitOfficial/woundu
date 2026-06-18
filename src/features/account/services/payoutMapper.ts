import type { PayoutAccountType } from "@/constants/payoutAccountTypes";
import type { SellerPayoutMethod, SellerPayoutProfile } from "@/features/orders/types";

export type PayoutMethodRow = {
  id: string;
  user_id: string;
  account_type: PayoutAccountType;
  entity_name: string;
  account_number: string;
  account_holder: string;
  instructions: string | null;
  is_primary: boolean;
  sort_order: number;
  updated_at: string;
};

export type PayoutProfileRow = {
  user_id: string;
  updated_at: string;
};

export function mapPayoutMethodRow(row: PayoutMethodRow): SellerPayoutMethod {
  return {
    id: row.id,
    userId: row.user_id,
    accountType: row.account_type,
    entityName: row.entity_name,
    accountNumber: row.account_number,
    accountHolder: row.account_holder,
    instructions: row.instructions?.trim() ? row.instructions.trim() : null,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

export function sortPayoutMethods(
  methods: ReadonlyArray<SellerPayoutMethod>,
): SellerPayoutMethod[] {
  return [...methods].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }

    return left.sortOrder - right.sortOrder;
  });
}

export function buildSellerPayoutProfile(
  userId: string,
  profileRow: PayoutProfileRow | null,
  methodRows: ReadonlyArray<PayoutMethodRow>,
): SellerPayoutProfile | null {
  const methods = sortPayoutMethods(methodRows.map(mapPayoutMethodRow));

  if (!profileRow && methods.length === 0) {
    return null;
  }

  return {
    userId,
    methods,
    updatedAt: profileRow?.updated_at ?? methods[0]?.updatedAt ?? null,
  };
}

export function sellerHasPayoutMethods(
  profile: SellerPayoutProfile | null,
): profile is SellerPayoutProfile {
  return Boolean(profile && profile.methods.length > 0);
}
