import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";

import { AccountFavoriteListItem } from "@/components/account/AccountFavoriteListItem";
import { AccountFavoritesPagination } from "@/components/account/AccountFavoritesPagination";
import { ACCOUNT_FAVORITES_PAGE_SIZE } from "@/features/account/favoriteConstants";
import { getFavoriteProductsPaginated } from "@/services/supabase/account/favoriteAccountService";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Mis favoritos",
  robots: { index: false, follow: false },
};

type AccountFavoritesPageProps = Readonly<{
  searchParams: Promise<{ page?: string }>;
}>;

function parsePageParam(value: string | undefined): number {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export default async function AccountFavoritesPage({
  searchParams,
}: AccountFavoritesPageProps) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta%2Ffavoritos");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Fcuenta%2Ffavoritos");
  }

  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);
  const favoritesPage = await getFavoriteProductsPaginated(
    supabase,
    user.id,
    requestedPage,
    ACCOUNT_FAVORITES_PAGE_SIZE,
  );

  if (
    favoritesPage.totalPages > 0 &&
    requestedPage > favoritesPage.totalPages
  ) {
    redirect(`/cuenta/favoritos?page=${favoritesPage.totalPages}`);
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-brand"
            href="/cuenta"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Volver a mi cuenta
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500 text-white">
              <Heart aria-hidden className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Mis favoritos
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {favoritesPage.total === 0
                  ? "Aun no guardaste productos."
                  : `${favoritesPage.total} producto${favoritesPage.total === 1 ? "" : "s"} guardado${favoritesPage.total === 1 ? "" : "s"}.`}
              </p>
            </div>
          </div>
        </div>

        {favoritesPage.total === 0 ? (
          <section className="rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 px-4 py-12 text-center text-sm text-slate-600">
            Explora el{" "}
            <Link className="font-bold text-brand underline" href="/marketplace">
              marketplace
            </Link>{" "}
            y marca tus favoritos para verlos aqui.
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <ul className="grid gap-3">
              {favoritesPage.items.map((item) => (
                <AccountFavoriteListItem
                  item={item}
                  key={item.productId}
                  variant="detailed"
                />
              ))}
            </ul>

            <AccountFavoritesPagination
              page={favoritesPage.page}
              totalPages={favoritesPage.totalPages}
            />
          </section>
        )}
      </div>
    </main>
  );
}
