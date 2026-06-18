"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Home,
  LayoutGrid,
  LogIn,
  Menu,
  PackagePlus,
  ShieldCheck,
  Store,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import type { UserNotification } from "@/features/notifications/types";
import { HeaderProfileButton } from "./HeaderProfileButton";
import { HeaderSignOutButton } from "./HeaderSignOutButton";
import { BRAND_HEADER_LOGO_SRC, BRAND_NAME } from "@/constants/branding";
import { NAV_ITEMS } from "@/constants/landing";
import { cn } from "@/lib/utils";
import {
  CountryMarketplaceSelect,
  CountryMarketplaceSelectFallback,
} from "./CountryMarketplaceSelect";

type SiteHeaderClientProps = Readonly<{
  canPublish?: boolean;
  displayName?: string | null;
  isLoggedIn: boolean;
  isSuperAdmin?: boolean;
  profileAvatarUrl?: string | null;
  initialNotifications?: ReadonlyArray<UserNotification>;
  unreadCount?: number;
}>;

const headerLinkClass =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-white/95 transition hover:text-white";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/marketplace": Store,
  "/marketplace#categorias": LayoutGrid,
  "/paises": Globe,
};

export function SiteHeaderClient({
  canPublish = false,
  displayName = "Usuario",
  initialNotifications = [],
  isLoggedIn,
  isSuperAdmin = false,
  profileAvatarUrl = null,
  unreadCount = 0,
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const isMarketplace =
    pathname === "/marketplace" || pathname.startsWith("/marketplace/");
  const showPublish = isLoggedIn && canPublish && !isMarketplace;
  const userName = displayName?.trim() || "Usuario";

  return (
    <header className="sticky top-0 z-50 border-b border-brand-dark/40 bg-brand shadow-md shadow-brand-dark/25">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          className="flex shrink-0 items-center rounded-md bg-white/95 px-2 py-1 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
          href="/"
        >
          <img
            alt={`${BRAND_NAME}, ir al inicio`}
            className="h-9 w-auto max-w-[9.5rem] object-contain object-left sm:h-10 sm:max-w-[10.5rem]"
            decoding="async"
            height={44}
            src={BRAND_HEADER_LOGO_SRC}
            width={128}
          />
        </Link>

        <nav
          aria-label="Navegacion principal"
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <HeaderNavLink
                className={cn(
                  headerLinkClass,
                  isActive && "text-white underline decoration-2 underline-offset-4",
                )}
                href={item.href}
                icon={NAV_ICONS[item.href]}
                key={item.href}
                label={item.label}
              />
            );
          })}
        </nav>

        <Suspense
          fallback={<CountryMarketplaceSelectFallback layout="desktop" />}
        >
          <CountryMarketplaceSelect layout="desktop" />
        </Suspense>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <NotificationBell
                initialNotifications={initialNotifications}
                unreadCount={unreadCount}
              />
              {isSuperAdmin ? <HeaderAdminButton /> : null}
              {showPublish ? <HeaderPublishButton /> : null}
              <HeaderProfileButton
                avatarUrl={profileAvatarUrl}
                displayName={userName}
              />
              <HeaderSignOutButton />
            </>
          ) : null}
          {!isLoggedIn ? (
            <>
              <HeaderNavLink
                className={headerLinkClass}
                href="/login"
                icon={LogIn}
                label="Iniciar sesion"
              />
              <Link
                className={cn(
                  buttonVariants({ size: "sm", variant: "secondary" }),
                  "border-white/50 bg-white font-semibold text-slate-900 shadow-sm hover:bg-white/90",
                )}
                href="/registro"
              >
                <UserPlus aria-hidden="true" className="h-4 w-4" />
                Crear cuenta
              </Link>
            </>
          ) : null}
        </div>

        <details className="relative md:hidden">
          <summary
            aria-label="Abrir menu de navegacion"
            className="flex h-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/40 bg-white/15 px-3 text-white shadow-sm transition hover:bg-white/25 [&::-webkit-details-marker]:hidden"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,20rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-950/10">
            <Suspense
              fallback={<CountryMarketplaceSelectFallback layout="mobile" />}
            >
              <CountryMarketplaceSelect layout="mobile" />
            </Suspense>
            <nav aria-label="Navegacion movil" className="mt-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <MobileNavLink
                  href={item.href}
                  icon={NAV_ICONS[item.href]}
                  key={item.href}
                  label={item.label}
                />
              ))}
              <div className="my-2 border-t border-slate-100" />
              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2">
                    <NotificationBell
                      initialNotifications={initialNotifications}
                      tone="panel"
                      unreadCount={unreadCount}
                    />
                  </div>
                  <HeaderProfileButton
                    avatarUrl={profileAvatarUrl}
                    displayName={userName}
                    tone="panel"
                  />
                  {isSuperAdmin ? (
                    <MobileNavLink href="/admin" icon={ShieldCheck} label="Admin" />
                  ) : null}
                  {showPublish ? (
                    <MobileNavLink
                      href="/publicar"
                      icon={PackagePlus}
                      label="Publicar"
                    />
                  ) : null}
                  <div className="px-3 py-2">
                    <HeaderSignOutButton tone="panel" />
                  </div>
                </>
              ) : null}
              {!isLoggedIn ? (
                <>
                  <MobileNavLink href="/login" icon={LogIn} label="Iniciar sesion" />
                  <Link
                    className={cn(
                      buttonVariants({
                        className: "mt-2 w-full",
                        variant: "primary",
                      }),
                    )}
                    href="/registro"
                  >
                    <UserPlus aria-hidden="true" className="h-4 w-4" />
                    Crear cuenta
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}

function HeaderAdminButton() {
  const pathname = usePathname();
  const isActive = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-label="Panel de administración"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
        isActive && "bg-white/25 ring-2 ring-white/30",
      )}
      href="/admin"
    >
      <ShieldCheck aria-hidden className="h-5 w-5" />
    </Link>
  );
}

function HeaderPublishButton() {
  const pathname = usePathname();
  const isActive = pathname === "/publicar" || pathname.startsWith("/publicar/");

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-label="Publicar producto"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
        isActive && "bg-white/25 ring-2 ring-white/30",
      )}
      href="/publicar"
    >
      <PackagePlus aria-hidden className="h-5 w-5" />
    </Link>
  );
}

function HeaderNavLink({
  className,
  href,
  icon: Icon,
  label,
}: Readonly<{
  className?: string;
  href: string;
  icon?: LucideIcon;
  label: string;
}>) {
  return (
    <Link className={className} href={href}>
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
}: Readonly<{
  href: string;
  icon?: LucideIcon;
  label: string;
}>) {
  return (
    <Link
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
      href={href}
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" /> : null}
      {label}
    </Link>
  );
}
