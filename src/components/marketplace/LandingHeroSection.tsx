import { LandingHero } from "@/components/marketplace";
import { getLandingPageSnapshot } from "@/features/products";

export async function LandingHeroSection() {
  const snapshot = await getLandingPageSnapshot();

  return <LandingHero snapshot={snapshot} />;
}
