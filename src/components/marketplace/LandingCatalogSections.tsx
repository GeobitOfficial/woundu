import {
  HomeCategoryNav,
  HomeProductSection,
} from "@/components/marketplace";
import { getLandingPageData } from "@/features/products";

function LandingProductsSkeleton() {
  return (
    <div>
      <div className="h-40 animate-pulse bg-[#131921]" />
      <div className="h-48 animate-pulse bg-brand/30" />
      <div className="h-56 animate-pulse bg-white" />
      <div className="h-52 animate-pulse bg-[#f7fafa]" />
      <div className="h-56 animate-pulse bg-white" />
      <div className="h-52 animate-pulse bg-slate-100" />
      <div className="h-48 animate-pulse bg-white" />
    </div>
  );
}

export async function LandingCatalogSections() {
  const { catalogProducts, categories, productSections } =
    await getLandingPageData();

  return (
    <>
      {productSections.flatMap((section, index) => {
        const blocks = [
          <HomeProductSection key={section.id} section={section} />,
        ];

        if (index === 1) {
          blocks.push(
            <HomeCategoryNav
              categories={categories}
              key="home-category-nav"
              products={catalogProducts}
            />,
          );
        }

        return blocks;
      })}
    </>
  );
}

export { LandingProductsSkeleton };
