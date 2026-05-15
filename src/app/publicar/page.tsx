import type { Metadata } from "next";

import { ProductForm } from "@/components/forms";
import { getMarketplaceCategories } from "@/features/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publicar producto",
  description:
    "Publica un producto en Woundu y empieza a vender en el marketplace.",
};

export default async function PublishProductPage() {
  const categories = await getMarketplaceCategories();

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
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

        <ProductForm categories={categories} />
      </section>
    </main>
  );
}
