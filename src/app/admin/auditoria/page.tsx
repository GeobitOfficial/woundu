import type { Metadata } from "next";

import { AuditLogManagement } from "@/components/admin/AuditLogManagement";
import { getAdminAuditLogs } from "@/features/admin/services/adminReadService";

export const metadata: Metadata = {
  title: "Auditoría Super Admin",
};

export default async function AdminAuditPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Auditoría de acciones
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Historial de operaciones realizadas por Super Admin: moderación, pagos,
          reembolsos, bans, cambios de rol y más.
        </p>
      </section>

      <AuditLogManagement initialLogs={logs} />
    </div>
  );
}
