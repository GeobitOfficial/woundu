import { Suspense } from "react";

import {
  LandingCatalogSections,
  LandingProductsSkeleton,
} from "@/components/marketplace/LandingCatalogSections";
import { LandingHeroSection } from "@/components/marketplace/LandingHeroSection";

export const revalidate = 60;

export default function Home() {
  return (
    <main className="bg-[#eaeded]">
      <Suspense
        fallback={
          <div className="h-36 animate-pulse bg-[#eaeded]" aria-hidden="true" />
        }
      >
        <LandingHeroSection />
      </Suspense>

      <Suspense fallback={<LandingProductsSkeleton />}>
        <LandingCatalogSections />
      </Suspense>
    </main>
  );
}
