"use client";

import { usePathname } from "next/navigation";

import type { AdminNavKey } from "./AdminShell";
import { AdminShell } from "./AdminShell";

type AdminShellClientProps = Readonly<{
  children: React.ReactNode;
  profileName: string;
  role: string;
}>;

export function AdminShellClient({
  children,
  profileName,
  role,
}: AdminShellClientProps) {
  const pathname = usePathname();
  const activeNav = resolveAdminNav(pathname);

  return (
    <AdminShell activeNav={activeNav} profileName={profileName} role={role}>
      {children}
    </AdminShell>
  );
}

function resolveAdminNav(pathname: string): AdminNavKey {
  if (pathname.startsWith("/admin/categorias")) {
    return "categories";
  }

  if (pathname.startsWith("/admin/productos")) {
    return "products";
  }

  if (pathname.startsWith("/admin/usuarios")) {
    return "users";
  }

  if (pathname.startsWith("/admin/ordenes")) {
    return "orders";
  }

  if (pathname.startsWith("/admin/pagos")) {
    return "payments";
  }

  if (pathname.startsWith("/admin/soporte")) {
    return "support";
  }

  if (pathname.startsWith("/admin/resenas")) {
    return "reviews";
  }

  if (pathname.startsWith("/admin/paises")) {
    return "countries";
  }

  if (pathname.startsWith("/admin/auditoria")) {
    return "audit";
  }

  return "overview";
}
