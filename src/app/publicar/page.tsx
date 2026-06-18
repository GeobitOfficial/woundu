import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProductForm } from "@/components/forms";
import { getMarketplaceCategories } from "@/features/products";
import { getAccountDashboard } from "@/services/supabase/account/accountService";
import { canAccessSellerFeatures } from "@/lib/auth/roles";
import { getAuthenticatedProfile } from "@/services/supabase/auth/getAuthenticatedProfile";
import { getSellerLocale } from "@/services/supabase/account/getSellerLocale";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publicar producto",
  description:
    "Publica un producto en Woundu y empieza a vender en el marketplace.",
};

export default async function PublishProductPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fpublicar");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fpublicar");
  }

  const profile = await getAuthenticatedProfile();

  if (!canAccessSellerFeatures(profile?.role)) {
    redirect("/cuenta");
  }

  const [categories, sellerLocale, accountSnapshot] = await Promise.all([
    getMarketplaceCategories(),
    getSellerLocale(supabase, user.id),
    getAccountDashboard(supabase, user.id),
  ]);
  const sellerWhatsappConfigured = Boolean(
    accountSnapshot.profile?.whatsapp?.replace(/\D/g, "").length &&
      (accountSnapshot.profile.whatsapp.replace(/\D/g, "").length ?? 0) >= 8,
  );

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            Vender en Woundu
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Publica tu producto.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Presenta tu producto con una descripcion clara, precio visible y
            detalles que ayuden a los compradores a decidir con confianza.
          </p>
        </div>

        {!sellerWhatsappConfigured ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            Debes registrar tu numero de WhatsApp en{" "}
            <Link className="font-bold text-brand underline" href="/cuenta/perfil">
              tu perfil
            </Link>{" "}
            antes de publicar productos. Los compradores lo usaran para coordinar
            envio y pago.
          </div>
        ) : null}

        <ProductForm categories={categories} sellerLocale={sellerLocale} />
      </section>
    </main>
  );
}
