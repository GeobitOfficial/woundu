import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HOME_SECTION_REFERENCE_IMAGES } from "@/constants/homeSectionImages";
import type { ProductCardItem } from "@/features/products";
import type { Category } from "@/types";

import { getCategoryIcon } from "./categoryIconMap";
import { ProductThumbnail } from "./ProductThumbnail";
import { SectionReferenceImage } from "./SectionReferenceImage";

type HomeCategoryNavProps = Readonly<{
  categories: ReadonlyArray<Category>;
  products: ReadonlyArray<ProductCardItem>;
}>;

export function HomeCategoryNav({ categories, products }: HomeCategoryNavProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="home-category-nav-heading"
      className="border-y border-slate-200/80 bg-white py-10 lg:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReferenceImage
          className="mb-8 h-36 rounded-2xl shadow-sm ring-1 ring-slate-200/80 sm:h-44"
          image={HOME_SECTION_REFERENCE_IMAGES.categorias}
        />

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand">
              Departamentos
            </p>
            <h2
              className="mt-2 text-3xl font-black tracking-tight text-slate-950"
              id="home-category-nav-heading"
            >
              Compra por categoría
            </h2>
          </div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-brand hover:underline"
            href="/marketplace#categorias"
          >
            Ver catálogo completo
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryNavItem
              category={category}
              key={category.id}
              previewProduct={findPreviewProduct(products, category.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryNavItem({
  category,
  previewProduct,
}: Readonly<{
  category: Category;
  previewProduct: ProductCardItem | undefined;
}>) {
  const href = `/marketplace?categoria=${encodeURIComponent(category.slug)}`;
  const Icon = getCategoryIcon(category.icon);

  return (
    <Link
      className="group flex flex-col items-center gap-3 text-center"
      href={href}
    >
      <div className="flex aspect-square w-full max-w-[7.5rem] items-center justify-center rounded-full bg-gradient-to-br from-slate-100 via-white to-brand-light shadow-sm ring-1 ring-slate-200/80 transition group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-brand/30">
        <Icon aria-hidden="true" className="h-9 w-9 text-brand-dark" />
      </div>
      <span className="max-w-[8rem] text-sm font-semibold leading-4 text-slate-800 transition group-hover:text-brand">
        {category.name}
      </span>
    </Link>
  );
}

function findPreviewProduct(
  products: ReadonlyArray<ProductCardItem>,
  categoryId: string,
): ProductCardItem | undefined {
  return products.find((product) => product.categoryId === categoryId);
}
