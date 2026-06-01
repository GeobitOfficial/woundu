import type { Metadata } from "next";

import {
  CountriesBenefitsSection,
  CountriesCallToAction,
} from "@/components/marketplace/CountriesBenefitsSection";
import { CountriesExplorer } from "@/components/marketplace/CountriesExplorer";
import {
  CountriesHero,
  CountriesTopMarkets,
} from "@/components/marketplace/CountriesHero";
import { getActiveProductCountByCountry } from "@/features/products";
import {
  buildCountryCoverageItems,
  summarizeCountryCoverage,
} from "@/lib/marketplaceCountryCoverage";

export const metadata: Metadata = {
  title: "Países",
  description:
    "Explora los países de Latinoamérica y el Caribe en Woundu. Catálogo organizado por mercado local, filtros claros y publicaciones con contexto geográfico.",
  openGraph: {
    title: "Países de Latinoamérica y el Caribe | Woundu",
    description:
      "Compra y vende por país en un marketplace regional con catálogo ordenado y filtros claros.",
  },
};

export default async function PaisesPage() {
  const countByCountry = await getActiveProductCountByCountry();
  const countries = buildCountryCoverageItems(countByCountry);
  const summary = summarizeCountryCoverage(countries);

  return (
    <main className="min-h-screen">
      <CountriesHero summary={summary} />
      <CountriesTopMarkets summary={summary} />
      <CountriesBenefitsSection />
      <CountriesExplorer countries={countries} />
      <CountriesCallToAction />
    </main>
  );
}
