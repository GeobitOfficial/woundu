import {
  CategoryPreview,
  FeatureSection,
  LandingHero,
  TrustSection,
} from "@/components/marketplace";
import {
  buildLandingHomeCopy,
  getLandingPageData,
} from "@/features/products";

export const revalidate = 60;

export default async function Home() {
  const { snapshot, categories, countByCategoryId } =
    await getLandingPageData();
  const copy = buildLandingHomeCopy(snapshot);

  return (
    <main>
      <LandingHero copy={copy} snapshot={snapshot} />
      <FeatureSection features={copy.features} />
      <CategoryPreview
        categories={categories}
        countByCategoryId={countByCategoryId}
      />
      <TrustSection trust={copy.trust} />
    </main>
  );
}
