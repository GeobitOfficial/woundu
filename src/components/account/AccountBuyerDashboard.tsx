import { AccountBuyerActionBar } from "@/components/account/AccountBuyerActionBar";
import { AccountBuyerFavorites } from "@/components/account/AccountBuyerFavorites";
import { AccountBuyerHero } from "@/components/account/AccountBuyerHero";
import { AccountBuyerOrders } from "@/components/account/AccountBuyerOrders";
import { PendingReviewsSection } from "@/components/reviews/PendingReviewsSection";
import type { AccountDashboardSnapshot } from "@/features/account/types";
import type { PendingProductReview } from "@/features/reviews/types";

type AccountBuyerDashboardProps = Readonly<{
  authFullName: string | null;
  email: string;
  pendingReviews: ReadonlyArray<PendingProductReview>;
  snapshot: AccountDashboardSnapshot;
  unreadNotificationCount?: number;
}>;

export function AccountBuyerDashboard({
  authFullName,
  email,
  pendingReviews,
  snapshot,
  unreadNotificationCount = 0,
}: AccountBuyerDashboardProps) {
  const { profile, buyerOrders, favoriteProducts } = snapshot;
  const displayName = profile?.fullName ?? authFullName ?? "Usuario";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-slate-50 pb-12">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
        <AccountBuyerHero
          authFullName={authFullName}
          displayName={displayName}
          email={email}
          profile={profile}
        />

        <AccountBuyerActionBar
          favoritesCount={favoriteProducts.length}
          ordersCount={buyerOrders.length}
          pendingReviewsCount={pendingReviews.length}
          unreadNotificationCount={unreadNotificationCount}
        />

        <PendingReviewsSection pendingReviews={pendingReviews} />

        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <AccountBuyerOrders buyerOrders={buyerOrders} />
          <AccountBuyerFavorites favoriteProducts={favoriteProducts} />
        </div>
      </div>
    </main>
  );
}
