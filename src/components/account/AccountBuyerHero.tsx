import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  PencilLine,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { buttonVariants } from "@/components/ui";
import type { AccountProfileView } from "@/features/account/types";
import { getAvatarUrl, getInitials } from "@/lib/avatars/getAvatarUrl";
import { getRoleLabel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type AccountBuyerHeroProps = Readonly<{
  authFullName: string | null;
  displayName: string;
  email: string;
  profile: AccountProfileView | null;
}>;

export function AccountBuyerHero({
  authFullName,
  displayName,
  email,
  profile,
}: AccountBuyerHeroProps) {
  const avatarUrl = getAvatarUrl(profile?.avatarUrl ?? null);
  const initials = getInitials(displayName);
  const roleLabel = getRoleLabel(profile?.role ?? "buyer");
  const firstName = (profile?.fullName ?? authFullName ?? displayName).split(
    " ",
  )[0];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/8 via-white to-slate-50 px-5 py-6 shadow-sm sm:px-8 sm:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-brand-light/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-full border-3 border-white bg-white shadow-lg ring-4 ring-brand/15 sm:h-24 sm:w-24">
              {avatarUrl ? (
                <img
                  alt={`Foto de perfil de ${displayName}`}
                  className="h-full w-full object-cover"
                  src={avatarUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-light to-white text-lg font-black text-brand-dark">
                  {initials}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-3 border-white bg-brand text-white shadow-md">
              <ShoppingBag aria-hidden className="h-4 w-4" />
            </span>
          </div>

          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
              <Sparkles aria-hidden className="h-4 w-4" />
              Tu cuenta Woundu
            </p>
            <h1 className="mt-2 truncate text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              ¡Hola, {firstName}!
            </h1>
            <p className="mt-1 truncate text-sm text-slate-600">{email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-bold text-brand-dark ring-1 ring-brand/20">
                {roleLabel}
              </span>
              {profile?.country ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  <Globe2 aria-hidden className="h-3.5 w-3.5" />
                  {profile.country}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
          <Link
            className={cn(
              buttonVariants({ size: "md", variant: "secondary" }),
              "group w-full justify-center gap-2 sm:w-auto",
            )}
            href="/cuenta/perfil"
          >
            <PencilLine aria-hidden className="h-4 w-4" />
            <span>Editar perfil</span>
          </Link>
          <Link
            className={cn(
              buttonVariants({ size: "md" }),
              "group w-full justify-center gap-2 sm:w-auto",
            )}
            href="/marketplace"
          >
            <span>Explorar marketplace</span>
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
