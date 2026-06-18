import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";

import { SellerSalesListItem } from "@/components/account/SellerSalesListItem";
import { SellerSalesPagination } from "@/components/account/SellerSalesPagination";
import { SellerSalesTabNav } from "@/components/account/SellerSalesTabNav";
import { SELLER_SALES_PAGE_SIZE } from "@/features/account/sellerSalesConstants";
import { parseSellerSalesTab } from "@/lib/account/sellerSalesGroups";
import { canAccessSellerFeatures } from "@/lib/auth/roles";
import { getAuthenticatedProfile } from "@/services/supabase/auth/getAuthenticatedProfile";
import {
  getSellerSalesCounts,
  getSellerSalesPaginated,
} from "@/services/supabase/account/sellerSalesAccountService";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Mis ventas",
  robots: { index: false, follow: false },
};

type AccountSellerSalesPageProps = Readonly<{
  searchParams: Promise<{ page?: string; tab?: string }>;
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

export default async function AccountSellerSalesPage({
  searchParams,
}: AccountSellerSalesPageProps) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta%2Fmis-ventas");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Fcuenta%2Fmis-ventas");
  }

  const profile = await getAuthenticatedProfile();

  if (!canAccessSellerFeatures(profile?.role)) {
    redirect("/cuenta");
  }

  const params = await searchParams;
  const tab = parseSellerSalesTab(params.tab);
  const requestedPage = parsePageParam(params.page);

  const [counts, salesPage] = await Promise.all([
    getSellerSalesCounts(supabase, user.id),
    getSellerSalesPaginated(
      supabase,
      user.id,
      tab,
      requestedPage,
      SELLER_SALES_PAGE_SIZE,
    ),
  ]);

  if (salesPage.totalPages > 0 && requestedPage > salesPage.totalPages) {
    redirect(`/cuenta/mis-ventas?tab=${tab}&page=${salesPage.totalPages}`);
  }

  const tabTotal = tab === "pendientes" ? counts.pendientes : counts.finalizadas;
  const rangeStart =
    salesPage.total === 0
      ? 0
      : (salesPage.page - 1) * SELLER_SALES_PAGE_SIZE + 1;
  const rangeEnd = Math.min(
    salesPage.page * SELLER_SALES_PAGE_SIZE,
    salesPage.total,
  );

  const emptyMessage =
    tab === "pendientes"
      ? "No tienes ventas pendientes por confirmar."
      : "Aun no tienes ventas finalizadas.";

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
              <Store aria-hidden className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Mis ventas
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Gestiona pedidos pendientes y consulta tu historial de ventas
                finalizadas.
              </p>
            </div>
          </div>
        </div>

        <SellerSalesTabNav activeTab={tab} counts={counts} />

        {tabTotal === 0 ? (
          <section className="rounded-2xl border border-dashed border-brand/25 bg-brand-light/40 px-4 py-12 text-center text-sm text-slate-600">
            {emptyMessage}{" "}
            {tab === "pendientes" ? (
              <>
                Cuando un comprador pague, aparecera aqui para que confirmes el
                cobro.
              </>
            ) : null}
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <p className="mb-4 text-sm text-slate-600">
              Mostrando{" "}
              <span className="font-bold text-slate-900">
                {rangeStart}-{rangeEnd}
              </span>{" "}
              de{" "}
              <span className="font-bold text-slate-900">{salesPage.total}</span>{" "}
              {tab === "pendientes" ? "ventas pendientes" : "ventas finalizadas"}
            </p>

            <ul className="grid gap-4">
              {salesPage.items.map((line) => (
                <SellerSalesListItem key={line.id} line={line} />
              ))}
            </ul>

            <SellerSalesPagination
              page={salesPage.page}
              tab={tab}
              totalPages={salesPage.totalPages}
            />
          </section>
        )}
      </div>
    </main>
  );
}
