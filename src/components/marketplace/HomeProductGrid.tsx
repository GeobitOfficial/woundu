import Link from "next/link";

import type { ProductCardItem } from "@/features/products";

import { HomeProductCard } from "./HomeProductCard";

type HomeProductGridProps = Readonly<{
  title: string;
  subtitle?: string;
  products: ReadonlyArray<ProductCardItem>;
  viewAllHref: string;
  viewAllLabel?: string;
}>;

export function HomeProductGrid({
  products,
  subtitle,
  title,
  viewAllHref,
  viewAllLabel = "Ver todo",
}: HomeProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className="flex items-end justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-lg font-bold text-slate-950 sm:text-xl">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
            ) : null}
          </div>
          <Link
            className="text-sm font-semibold text-brand hover:underline"
            href={viewAllHref}
          >
            {viewAllLabel}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.slice(0, 6).map((product) => (
            <div className="bg-white" key={product.id}>
              <HomeProductCard layout="compact" product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
