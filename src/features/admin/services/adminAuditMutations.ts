import { getCurrentUser, supabase } from "@/services/supabase/client";
import { isSuperAdmin } from "@/lib/auth/roles";
import type { AdminAuditAction } from "@/lib/admin/auditActions";

type LogAdminActionInput = Readonly<{
  action: AdminAuditAction;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}>;

export async function logAdminAction(input: LogAdminActionInput): Promise<void> {
  const { data, error } = await getCurrentUser();
  if (error || !data.user) {
    return;
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profileRow || !isSuperAdmin(profileRow.role)) {
    return;
  }

  await supabase.from("admin_audit_logs").insert({
    actor_id: data.user.id,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    summary: input.summary,
    metadata: input.metadata ?? {},
  });
}
