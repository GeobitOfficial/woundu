import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, PackagePlus } from "lucide-react";

import { SellerPublicationsPanel } from "@/components/account/SellerPublicationsPanel";
import { buttonVariants } from "@/components/ui";
import { buildSellerProductSections } from "@/features/products/buildSellerProductSections";
import { getSellerProducts } from "@/features/products/services/sellerProductService";
import { canAccessSellerFeatures } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { getAuthenticatedProfile } from "@/services/supabase/auth/getAuthenticatedProfile";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Mis publicaciones",
  robots: { index: false, follow: false },
};

export default async function SellerPublicationsPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta%2Fpublicaciones");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Fcuenta%2Fpublicaciones");
  }

  const profile = await getAuthenticatedProfile();

  if (!canAccessSellerFeatures(profile?.role)) {
    redirect("/cuenta");
  }

  const products = await getSellerProducts(supabase, user.id);
  const sections = buildSellerProductSections(products);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-brand"
              href="/cuenta"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Volver a mi cuenta
            </Link>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-brand">
              Panel vendedor
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Mis publicaciones
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Revisa tus productos por categoria, editalos o eliminalos cuando lo
              necesites.
            </p>
          </div>

          <Link
            className={cn(
              buttonVariants({ size: "sm", variant: "primary" }),
              "inline-flex items-center gap-2",
            )}
            href="/publicar"
          >
            <PackagePlus aria-hidden className="h-4 w-4" />
            Publicar producto
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm text-slate-600">
              Aun no tienes publicaciones activas en tu catalogo.
            </p>
            <Link
              className={cn(
                buttonVariants({ className: "mt-4", variant: "primary" }),
              )}
              href="/publicar"
            >
              Publicar tu primer producto
            </Link>
          </div>
        ) : (
          <SellerPublicationsPanel sections={sections} />
        )}
      </div>
    </main>
  );
}
