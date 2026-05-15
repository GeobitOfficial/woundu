"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { buttonVariants } from "@/components/ui";
import {
  CountryMarketplaceSelect,
  CountryMarketplaceSelectFallback,
} from "./CountryMarketplaceSelect";
import { BRAND_HEADER_LOGO_SRC, BRAND_NAME } from "@/constants/branding";
import { NAV_ITEMS } from "@/constants/landing";
import { cn } from "@/lib/utils";

type SiteHeaderClientProps = Readonly<{
  isLoggedIn: boolean;
}>;

export function SiteHeaderClient({ isLoggedIn }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const isMarketplace = pathname === "/marketplace" || pathname.startsWith("/marketplace/");
  const showPublish = isLoggedIn && !isMarketplace;

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-200/50 bg-gradient-to-r from-emerald-50/95 via-white/88 to-cyan-50/90 backdrop-blur-xl shadow-sm shadow-emerald-900/5">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          className="flex shrink-0 items-center rounded-md outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-950/25"
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
          {NAV_ITEMS.map((item) => (
            <Link
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Suspense
          fallback={<CountryMarketplaceSelectFallback layout="desktop" />}
        >
          <CountryMarketplaceSelect layout="desktop" />
        </Suspense>

        <div className="hidden shrink-0 items-center gap-2 md:flex">          {isLoggedIn ? (
            <>
              <Link
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                href="/cuenta"
              >
                Cuenta
              </Link>
              {showPublish ? (
                <Link
                  className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                  href="/publicar"
                >
                  Publicar
                </Link>
              ) : null}
            </>
          ) : null}
          {!isLoggedIn ? (
            <>
              <Link
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                href="/login"
              >
                Iniciar sesion
              </Link>
              <Link
                className={cn(
                  buttonVariants({ size: "sm", variant: "secondary" }),
                )}
                href="/registro"
              >
                Crear cuenta
              </Link>
            </>
          ) : null}
        </div>

        <details className="relative md:hidden">
          <summary
            aria-label="Abrir menu de navegacion"
            className="flex h-10 cursor-pointer list-none items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,20rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-950/10">
            <Suspense
              fallback={<CountryMarketplaceSelectFallback layout="mobile" />}
            >
              <CountryMarketplaceSelect layout="mobile" />
            </Suspense>
            <nav aria-label="Navegacion movil" className="mt-3 flex flex-col gap-1">              {NAV_ITEMS.map((item) => (
                <Link
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 border-t border-slate-100" />
              {isLoggedIn ? (
                <>
                  <Link
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    href="/cuenta"
                  >
                    Cuenta
                  </Link>
                  {showPublish ? (
                    <Link
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                      href="/publicar"
                    >
                      Publicar
                    </Link>
                  ) : null}
                </>
              ) : null}
              {!isLoggedIn ? (
                <>
                  <Link
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    href="/login"
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    className={cn(
                      buttonVariants({
                        className: "mt-2 w-full",
                        variant: "primary",
                      }),
                    )}
                    href="/registro"
                  >
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
