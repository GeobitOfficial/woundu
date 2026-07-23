import { LandingHero } from "@/components/marketplace";
import { getLandingPageData } from "@/features/products";

export async function LandingHeroSection() {
  const data = await getLandingPageData();

  return (
    <LandingHero
      catalogProducts={data.catalogProducts}
      latestProducts={data.latestProducts}
      offerProducts={data.offerProducts}
      showcasedProduct={data.snapshot.showcasedProduct}
      snapshot={data.snapshot}
      topRatedProducts={data.topRatedProducts}
    />
  );
}
