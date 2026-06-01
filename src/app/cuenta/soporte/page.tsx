import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SupportTicketsPanel } from "@/components/support/SupportTicketsPanel";
import { getUserSupportTickets } from "@/features/support";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Soporte",
  robots: { index: false, follow: false },
};

export default async function AccountSupportPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta%2Fsoporte");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Fcuenta%2Fsoporte");
  }

  const tickets = await getUserSupportTickets(user.id);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            Centro de ayuda
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Soporte Woundu
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Crea un ticket para contactar al equipo de soporte. Recibirás
            respuestas aquí mismo cuando el Super Admin revise tu caso.
          </p>
        </div>

        <SupportTicketsPanel initialTickets={tickets} />
      </div>
    </main>
  );
}
