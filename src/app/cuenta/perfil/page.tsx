import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";

import { AccountProfileCard } from "@/components/account/AccountProfileCard";
import { getAccountDashboard } from "@/services/supabase/account/accountService";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Editar perfil",
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta%2Fperfil");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Fcuenta%2Fperfil");
  }

  const snapshot = await getAccountDashboard(supabase, user.id);
  const { profile } = snapshot;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
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
              <PencilLine aria-hidden className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Editar perfil
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Actualiza tu foto, país y datos públicos de tu cuenta.
              </p>
            </div>
          </div>
        </div>

        {profile ? (
          <AccountProfileCard layout="wide" profile={profile} />
        ) : (
          <section className="rounded-2xl border border-dashed border-brand/25 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Perfil no disponible
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Si acabas de registrarte, recarga en unos segundos o contacta
              soporte.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
