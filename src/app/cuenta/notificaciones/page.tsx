import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NotificationList } from "@/components/notifications/NotificationList";
import { getAllNotificationsForUser } from "@/features/notifications/services/notificationReadService";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Notificaciones",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta%2Fnotificaciones");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fcuenta%2Fnotificaciones");
  }

  const notifications = await getAllNotificationsForUser(user.id, 50);

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-light/20 via-white to-slate-50/80">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-950">
          Notificaciones
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Avisos de pedidos y actividad de tu cuenta en Woundu.
        </p>
        <div className="mt-6">
          <NotificationList notifications={notifications} />
        </div>
      </div>
    </main>
  );
}
