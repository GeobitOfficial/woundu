import type { Metadata } from "next";

import { AdminShellClient } from "@/components/admin/AdminShellClient";
import { requireSuperAdmin } from "@/services/supabase/auth/requireSuperAdmin";

export const metadata: Metadata = {
  title: "Super Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await requireSuperAdmin("/admin");

  return (
    <AdminShellClient profileName={profile.fullName} role={profile.role}>
      {children}
    </AdminShellClient>
  );
}
