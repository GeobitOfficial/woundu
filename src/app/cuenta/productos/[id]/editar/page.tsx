import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProductForm } from "@/components/forms";
import { getMarketplaceCategories } from "@/features/products";
import { getProductImagesForSeller } from "@/features/products/services/productImageMutations";
import { getSellerProductForEdit } from "@/features/products/services/sellerProductService";
import { getSellerLocale } from "@/services/supabase/account/getSellerLocale";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const metadata: Metadata = {
  title: "Editar producto",
  robots: { index: false, follow: false },
};

type EditProductPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?next=%2Fcuenta");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fcuenta");
  }

  const { id } = await params;

  const [categories, sellerLocale, product, existingImages] = await Promise.all([
    getMarketplaceCategories(),
    getSellerLocale(supabase, user.id),
    getSellerProductForEdit(supabase, user.id, id),
    getProductImagesForSeller(supabase, id, user.id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            Gestion de publicaciones
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Editar producto
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Puedes cambiar el pais del producto. Si lo mueves a otro mercado, el
            precio pasara a la moneda correspondiente (por ejemplo, USD en
            Estados Unidos).
          </p>
        </div>

        <ProductForm
          categories={categories}
          existingImages={existingImages}
          mode="edit"
          product={product}
          sellerLocale={sellerLocale}
        />
      </section>
    </main>
  );
}
