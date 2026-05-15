import type { Metadata } from "next";
import Link from "next/link";

import {
  LATIN_AMERICA_COUNTRIES,
  latinAmericaCountryToSlug,
} from "@/constants/latinAmericaCountries";

export const metadata: Metadata = {
  title: "Países",
  description:
    "Woundu organiza el catálogo por país para que encuentres productos cerca de ti y con contexto claro.",
};

export default function PaisesPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
          Cobertura regional
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Países de Latinoamérica y el Caribe
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Cada publicación en Woundu se asocia a un país para mantener el catálogo
          ordenado, relevante y fácil de explorar según dónde compras o vendes.
        </p>

        <ul className="mt-10 columns-1 gap-x-8 text-sm text-slate-800 sm:columns-2">
          {LATIN_AMERICA_COUNTRIES.map((country) => (
            <li className="break-inside-avoid py-1.5 pl-1" key={country}>
              <Link
                className="text-slate-800 underline-offset-2 transition hover:text-emerald-800 hover:underline"
                href={`/marketplace?pais=${latinAmericaCountryToSlug(country)}`}
              >
                {country}
              </Link>
            </li>
          ))}
        </ul>      </div>
    </main>
  );
}
