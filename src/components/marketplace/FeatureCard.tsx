import { Search, ShieldCheck, Zap, type LucideIcon } from "lucide-react";

import type { LandingHomeFeatureBlock, LandingHomeFeatureIcon } from "@/features/products";

const featureIcons: Record<LandingHomeFeatureIcon, LucideIcon> = {
  search: Search,
  shield: ShieldCheck,
  zap: Zap,
};

type FeatureSectionProps = Readonly<{
  features: ReadonlyArray<LandingHomeFeatureBlock>;
}>;

export function FeatureSection({ features }: FeatureSectionProps) {
  return (
    <section
      className="border-y border-emerald-100/40 bg-gradient-to-b from-white/50 via-emerald-50/35 to-cyan-50/40 py-20"
      id="beneficios"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            Indicadores
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Resumen numérico del catálogo en vivo.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Cada tarjeta muestra un total calculado en el servidor a partir de tus
            datos en Supabase.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              description={feature.description}
              icon={feature.icon}
              key={feature.title}
              title={feature.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type FeatureCardProps = Readonly<{
  title: string;
  description: string;
  icon: LandingHomeFeatureIcon;
}>;

function FeatureCard({ description, icon, title }: FeatureCardProps) {
  const Icon = featureIcons[icon];

  return (
    <article className="rounded-3xl border border-emerald-100/60 bg-white/85 p-6 shadow-sm shadow-emerald-900/5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-200/70 hover:bg-white hover:shadow-xl hover:shadow-cyan-900/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/25">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <h3 className="mt-6 text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
