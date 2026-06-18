import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { AccountBuyerOrderListItem } from "@/components/account/AccountBuyerOrderListItem";
import { AccountBuyerOrdersPagination } from "@/components/account/AccountBuyerOrdersPagination";
import { ACCOUNT_BUYER_ORDERS_PAGE_SIZE } from "@/features/account/orderConstants";
import { canAccessBuyerFeatures } from "@/lib/auth/roles";
import { getBuyerOrdersPaginated } from "@/services/supabase/account/buyerOrdersAccountService";
import { getAuthenticatedProfile } from "@/services/supabase/auth/getAuthenticatedProfile";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Mis compras",
  robots: { index: false, follow: false },
};

type AccountPurchasesPageProps = Readonly<{
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

export default async function AccountPurchasesPage({
  searchParams,
}: AccountPurchasesPageProps) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta%2Fcompras");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Fcuenta%2Fcompras");
  }

  const profile = await getAuthenticatedProfile();

  if (!canAccessBuyerFeatures(profile?.role)) {
    redirect("/cuenta");
  }

  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);
  const ordersPage = await getBuyerOrdersPaginated(
    supabase,
    user.id,
    requestedPage,
    ACCOUNT_BUYER_ORDERS_PAGE_SIZE,
  );

  if (ordersPage.totalPages > 0 && requestedPage > ordersPage.totalPages) {
    redirect(`/cuenta/compras?page=${ordersPage.totalPages}`);
  }

  const rangeStart =
    ordersPage.total === 0
      ? 0
      : (ordersPage.page - 1) * ACCOUNT_BUYER_ORDERS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(
    ordersPage.page * ACCOUNT_BUYER_ORDERS_PAGE_SIZE,
    ordersPage.total,
  );

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
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <ShoppingBag aria-hidden className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Mis compras
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {ordersPage.total === 0
                  ? "Aun no tienes pedidos."
                  : `${ordersPage.total} pedido${ordersPage.total === 1 ? "" : "s"} en tu historial.`}
              </p>
            </div>
          </div>
        </div>

        {ordersPage.total === 0 ? (
          <section className="rounded-2xl border border-dashed border-brand/25 bg-brand-light/40 px-4 py-12 text-center text-sm text-slate-600">
            Explora el{" "}
            <Link className="font-bold text-brand underline" href="/marketplace">
              marketplace
            </Link>{" "}
            y realiza tu primera compra.
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <p className="mb-4 text-sm text-slate-600">
              Mostrando{" "}
              <span className="font-bold text-slate-900">
                {rangeStart}-{rangeEnd}
              </span>{" "}
              de{" "}
              <span className="font-bold text-slate-900">{ordersPage.total}</span>{" "}
              pedidos
            </p>

            <ul className="grid gap-4">
              {ordersPage.items.map((order) => (
                <AccountBuyerOrderListItem
                  key={order.id}
                  order={order}
                  variant="detailed"
                />
              ))}
            </ul>

            <AccountBuyerOrdersPagination
              page={ordersPage.page}
              totalPages={ordersPage.totalPages}
            />
          </section>
        )}
      </div>
    </main>
  );
}
