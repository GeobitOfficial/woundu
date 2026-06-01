import type { Metadata } from "next";

import { UserManagement } from "@/components/admin";
import { getAllUsersForAdmin } from "@/features/admin/services/adminReadService";

export const metadata: Metadata = {
  title: "Usuarios de la plataforma",
};

export default async function AdminUsersPage() {
  const users = await getAllUsersForAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Usuarios registrados
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Consulta cuentas, revisa reputación y banea usuarios que incumplan las
          normas de la plataforma.
        </p>
      </div>

      <UserManagement initialUsers={users} />
    </div>
  );
}
