"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui";
import { signOut } from "@/services/supabase/client";

export function AccountSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button onClick={handleSignOut} type="button" variant="secondary">
      <LogOut aria-hidden className="h-4 w-4" />
      Cerrar sesion
    </Button>
  );
}
