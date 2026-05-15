import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account";
import { getAccountDashboard } from "@/services/supabase/account/accountService";
import { createSupabaseServerClient } from "@/services/supabase/server";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    redirect("/login?next=%2Fcuenta");
  }

  const snapshot = await getAccountDashboard(supabase, user.id);

  const authFullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  return (
    <AccountDashboard
      authFullName={authFullName}
      email={user.email}
      snapshot={snapshot}
    />
  );
}
