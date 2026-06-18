"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui";
import { signOut } from "@/services/supabase/client";
import { cn } from "@/lib/utils";

type HeaderSignOutButtonProps = Readonly<{
  tone?: "header" | "panel";
}>;

export function HeaderSignOutButton({ tone = "header" }: HeaderSignOutButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  async function handleConfirmSignOut() {
    setIsSigningOut(true);
    await signOut();
    setIsOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        aria-label="Cerrar sesión"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
          tone === "header"
            ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
        )}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <LogOut aria-hidden className="h-5 w-5" />
      </button>

      <dialog
        className="fixed top-1/2 left-1/2 m-0 w-[min(100vw-2rem,24rem)] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-950/50"
        onCancel={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
        ref={dialogRef}
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-black text-slate-950">¿Cerrar sesión?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Saldrás de tu cuenta en Woundu. Podrás volver a iniciar sesión cuando
            quieras.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              disabled={isSigningOut}
              onClick={() => setIsOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button disabled={isSigningOut} onClick={() => void handleConfirmSignOut()} type="button">
              {isSigningOut ? "Saliendo..." : "Cerrar sesión"}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
