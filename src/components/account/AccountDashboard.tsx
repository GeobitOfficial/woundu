import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";

import { AccountBuyerSection } from "@/components/account/AccountBuyerSection";
import { AccountFavoritesSection } from "@/components/account/AccountFavoritesSection";
import { AccountProfileCard } from "@/components/account/AccountProfileCard";
import { AccountQuickActions } from "@/components/account/AccountQuickActions";
import { AccountSellerSection } from "@/components/account/AccountSellerSection";
import { AccountSignOutButton } from "@/components/account/AccountSignOutButton";
import { buttonVariants } from "@/components/ui";
import { formatCurrencyLabel } from "@/constants/countryCurrencies";
import type { AccountDashboardSnapshot } from "@/features/account/types";
import { getAvatarUrl, getInitials } from "@/lib/avatars/getAvatarUrl";
import type { SellerProductListItem } from "@/features/products/services/sellerProductService";
import { getRoleLabel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type AccountDashboardProps = Readonly<{
  email: string;
  authFullName: string | null;
  snapshot: AccountDashboardSnapshot;
  currentMonthEarnings: Readonly<{
    rangeLabel: string;
    totals: AccountDashboardSnapshot["sellerSalesTotals"];
  }>;
  sellerProducts: ReadonlyArray<SellerProductListItem>;
}>;

export function AccountDashboard({
  authFullName,
  currentMonthEarnings,
  email,
  sellerProducts,
  snapshot,
}: AccountDashboardProps) {
  const { profile, buyerOrders, sellerLines, productStats, sellerSalesTotals, favoriteProducts } =
    snapshot;
  const displayName = profile?.fullName ?? authFullName ?? "Usuario";
  const roleLabel = getRoleLabel(profile?.role);
  const avatarUrl = getAvatarUrl(profile?.avatarUrl ?? null);
  const initials = getInitials(displayName);

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-light/35 via-white to-slate-50/80">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-brand-dark/40 bg-brand p-6 text-white shadow-md shadow-brand-dark/25 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white/90 bg-white/10 shadow-xl ring-4 ring-white/20 sm:h-28 sm:w-28">
                {avatarUrl ? (
                  <img
                    alt={`Foto de perfil de ${displayName}`}
                    className="h-full w-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-dark/40 text-2xl font-black text-white">
                    {initials}
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/75">
                  Tu cuenta Woundu
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Hola, {displayName}
                </h1>
                <p className="mt-2 text-sm text-white/85">{email}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                    {roleLabel}
                  </span>
                  {profile ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                      <Star aria-hidden className="h-3.5 w-3.5" />
                      {profile.reputationScore.toFixed(1)} · {profile.reviewsCount}{" "}
                      reseñas
                    </span>
                  ) : null}
                  {profile?.country ? (
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                      {profile.country} · {profile.currency}
                    </span>
                  ) : profile ? (
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                      {formatCurrencyLabel(profile.currency)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
              {profile?.role === "super_admin" ? (
                <Link
                  className={cn(
                    buttonVariants({ size: "md", variant: "secondary" }),
                    "border-white/20 bg-white/95 text-brand-dark hover:bg-white",
                  )}
                  href="/admin"
                >
                  <ShieldCheck aria-hidden className="h-4 w-4" />
                  Panel Admin
                </Link>
              ) : null}
              <AccountSignOutButton className="border-white/30 bg-white/10 text-white hover:bg-white/20" />
            </div>
          </div>
        </section>

        <div className="mt-8">
          <AccountQuickActions />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <div className="xl:sticky xl:top-24">
              {profile ? (
                <AccountProfileCard profile={profile} />
              ) : (
                <section className="rounded-[2rem] border border-dashed border-brand/30 bg-white/90 p-8 text-center shadow-sm">
                  <h2 className="text-lg font-black text-slate-950">
                    Perfil no disponible
                  </h2>
                  <p className="mt-3 text-sm text-slate-600">
                    Si acabas de registrarte, recarga en unos segundos o contacta
                    soporte.
                  </p>
                </section>
              )}
            </div>
          </div>

          <div className="space-y-8 xl:col-span-8">
            <AccountSellerSection
              currentMonthEarnings={currentMonthEarnings}
              productStats={productStats}
              sellerLines={sellerLines}
              sellerProducts={sellerProducts}
              sellerSalesTotals={sellerSalesTotals}
            />

            <div className="grid gap-8 lg:grid-cols-2">
              <AccountBuyerSection buyerOrders={buyerOrders} />
              <AccountFavoritesSection favoriteProducts={favoriteProducts} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
