import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account";
import { getSellerProducts } from "@/features/products/services/sellerProductService";
import { getAccountDashboard } from "@/services/supabase/account/accountService";
import { getSellerEarningsForCurrentMonth } from "@/services/supabase/account/sellerEarningsService";
import { createSupabaseServerClient } from "@/services/supabase/server";
export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    redirect("/login?next=%2Fcuenta");
  }

  const snapshot = await getAccountDashboard(supabase, user.id);
  const [currentMonthEarnings, sellerProducts] = await Promise.all([
    getSellerEarningsForCurrentMonth(supabase, user.id),
    getSellerProducts(supabase, user.id),
  ]);
  const authFullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  return (
    <AccountDashboard
      authFullName={authFullName}
      currentMonthEarnings={currentMonthEarnings}
      email={user.email}
      sellerProducts={sellerProducts}
      snapshot={snapshot}
    />
  );
}
