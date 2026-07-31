import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account";
import { getMarketplaceProducts } from "@/features/products/services/productService";
import { getSellerPayoutForAccount } from "@/features/orders/services/orderReadService";
import { getPendingReviewsForBuyer } from "@/features/reviews/services/reviewReadService";
import { getAccountDashboard } from "@/services/supabase/account/accountService";
import { getSellerEarningsForCurrentMonth } from "@/services/supabase/account/sellerEarningsService";
import {
  getSellerSalesCounts,
  type SellerSalesCounts,
} from "@/services/supabase/account/sellerSalesAccountService";
import { getUnreadNotificationCount } from "@/features/notifications/services/notificationReadService";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { canAccessSellerFeatures } from "@/lib/auth/roles";
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
  const error = resolvedParams?.error ?? null;
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
  const showSellerFeatures = canAccessSellerFeatures(snapshot.profile?.role);

  const emptyEarnings = {
    rangeLabel: "",
    totals: snapshot.sellerSalesTotals,
  };
  const emptySalesCounts: SellerSalesCounts = {
    pendientes: 0,
    finalizadas: 0,
  };

  const [
    currentMonthEarnings,
    sellerPayout,
    pendingReviews,
    unreadNotificationCount,
    sellerSalesCounts,
    suggestedProducts,
  ] = await Promise.all([
      showSellerFeatures
        ? getSellerEarningsForCurrentMonth(supabase, user.id)
        : Promise.resolve(emptyEarnings),
      showSellerFeatures
        ? getSellerPayoutForAccount(user.id)
        : Promise.resolve(null),
      getPendingReviewsForBuyer(user.id),
      getUnreadNotificationCount(user.id),
      showSellerFeatures
        ? getSellerSalesCounts(supabase, user.id)
        : Promise.resolve(emptySalesCounts),
      getMarketplaceProducts({}),
    ]);
  const authFullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  const buyerSuggestions = (suggestedProducts || [])
    .filter((p: any) => p.sellerId !== user.id)
    .slice(0, 4);

  return (
    <AccountDashboard
      authFullName={authFullName}
      currentMonthEarnings={currentMonthEarnings}
      email={user.email}
      pendingReviews={pendingReviews}
      sellerPayout={sellerPayout}
      sellerSalesCounts={sellerSalesCounts}
      snapshot={snapshot}
      unreadNotificationCount={unreadNotificationCount}
      suggestedProducts={buyerSuggestions}
      error={error}
    />
  );
}
