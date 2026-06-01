import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { LandingCategoryShowcase } from "@/features/products";
import {
  formatProductPrice,
  getProductDiscountPercent,
  getProductMarketplaceHref,
} from "@/utils/productDisplay";

import { ProductThumbnail } from "./ProductThumbnail";

type CategoryShowcaseRowProps = Readonly<{
  showcases: ReadonlyArray<LandingCategoryShowcase>;
}>;

export function CategoryShowcaseRow({ showcases }: CategoryShowcaseRowProps) {
  if (showcases.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
      <div className="rounded-sm border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950">
            Compra por categoría
          </h2>
          <Link
            className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark hover:underline"
            href="/marketplace"
          >
            Todas
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {showcases.map((showcase) => (
            <CategoryCircle key={showcase.category.id} showcase={showcase} />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {showcases.map((showcase) => (
          <CategoryProductShelf key={showcase.category.id} showcase={showcase} />
        ))}
      </div>
    </section>
  );
}

function CategoryCircle({
  showcase,
}: Readonly<{ showcase: LandingCategoryShowcase }>) {
  const { category, products } = showcase;
  const categoryHref = `/marketplace?categoria=${encodeURIComponent(category.slug)}`;
  const previewProduct = products[0];

  if (!previewProduct) {
    return null;
  }

  return (
    <Link
      className="group flex min-w-[7rem] flex-col items-center gap-2 text-center"
      href={categoryHref}
    >
      <ProductThumbnail
        className="aspect-square w-24 rounded-full border border-slate-100 p-2 transition group-hover:border-brand/50 group-hover:shadow-md"
        product={previewProduct}
      />
      <span className="line-clamp-2 text-sm font-medium leading-4 text-slate-800 group-hover:text-brand">
        {category.name}
      </span>
    </Link>
  );
}

function CategoryProductShelf({
  showcase,
}: Readonly<{ showcase: LandingCategoryShowcase }>) {
  const { category, products } = showcase;
  const categoryHref = `/marketplace?categoria=${encodeURIComponent(category.slug)}`;

  return (
    <article className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 className="text-lg font-bold text-slate-950">{category.name}</h2>
        <Link
          className="inline-flex shrink-0 items-center text-sm font-semibold text-brand hover:text-brand-dark hover:underline"
          href={categoryHref}
        >
          Ver más
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {products.slice(0, 6).map((product) => (
          <CategoryProductCard key={product.id} product={product} />
        ))}
      </div>
    </article>
  );
}

function CategoryProductCard({
  product,
}: Readonly<{ product: LandingCategoryShowcase["products"][number] }>) {
  const discount = getProductDiscountPercent(product);

  return (
    <Link
      className="group flex min-h-full flex-col border-b border-r border-slate-100 bg-white p-3 transition hover:bg-slate-50"
      href={getProductMarketplaceHref(product)}
    >
      <ProductThumbnail className="aspect-square p-2" product={product} />
      <span className="mt-2 line-clamp-2 min-h-[2.25rem] text-sm leading-5 text-slate-800 group-hover:text-brand">
        {product.title}
      </span>
      <span className="mt-2 text-lg font-semibold text-slate-950">
        {formatProductPrice(product.price, product.currency)}
      </span>
      {discount != null ? (
        <span className="mt-0.5 text-xs font-bold text-brand">
          {discount}% OFF
        </span>
      ) : null}
    </Link>
  );
}
