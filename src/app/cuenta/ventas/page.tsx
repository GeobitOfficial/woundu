import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SellerEarningsFilters } from "@/components/account/SellerEarningsFilters";
import { SellerEarningsReport } from "@/components/account/SellerEarningsReport";
import { parseSellerEarningsFilter } from "@/lib/account/sellerEarningsPeriod";
import {
  getSellerEarnings,
} from "@/services/supabase/account/sellerEarningsService";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Mis ganancias",
  robots: { index: false, follow: false },
};

type SellerEarningsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function SellerEarningsPage({
  searchParams,
}: SellerEarningsPageProps) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta%2Fventas");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Fcuenta%2Fventas");
  }

  const resolvedSearchParams = await searchParams;
  const filter = parseSellerEarningsFilter(resolvedSearchParams);
  const snapshot = await getSellerEarnings(supabase, user.id, filter);
  const maxYear = new Date().getFullYear();

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            Panel vendedor
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Mis ganancias
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Consulta cuánto has ganado con tus ventas. Filtra por mes, semestre o
            año y elige el periodo que necesites revisar.
          </p>
        </div>

        <SellerEarningsFilters filter={filter} maxYear={maxYear} />
        <SellerEarningsReport snapshot={snapshot} />
      </div>
    </main>
  );
}
