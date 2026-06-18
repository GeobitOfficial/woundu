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
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/8 blur-2xl"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-md ring-2 ring-brand/10 sm:h-[4.5rem] sm:w-[4.5rem]">
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
            <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-sm">
              <ShoppingBag aria-hidden className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-dark">
              <Sparkles aria-hidden className="h-3 w-3" />
              Tu cuenta
            </p>
            <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950 sm:text-[1.75rem]">
              Hola, {firstName}
            </h1>
            <p className="truncate text-sm text-slate-500">{email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-bold text-brand-dark">
                {roleLabel}
              </span>
              {profile?.country ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  <Globe2 aria-hidden className="h-3 w-3" />
                  {profile.country}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            className={cn(
              buttonVariants({ size: "md", variant: "secondary" }),
              "group w-full justify-center sm:w-auto",
            )}
            href="/cuenta/perfil"
          >
            <PencilLine aria-hidden className="h-4 w-4" />
            Editar perfil
          </Link>
          <Link
            className={cn(
              buttonVariants({ size: "md" }),
              "group w-full justify-center sm:w-auto",
            )}
            href="/marketplace"
          >
            Explorar marketplace
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
