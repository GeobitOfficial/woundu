import {
  CreditCard,
  Percent,
  Search,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type { LandingHomeFeatureBlock, LandingHomeFeatureIcon } from "@/features/products";

const featureIcons: Record<LandingHomeFeatureIcon, LucideIcon> = {
  search: Search,
  shield: ShieldCheck,
  zap: Percent,
};

type FeatureSectionProps = Readonly<{
  features: ReadonlyArray<LandingHomeFeatureBlock>;
}>;

export function FeatureSection({ features }: FeatureSectionProps) {
  const benefits = [
    {
      icon: Truck,
      title: "Compra segura",
      description: "Vendedores con perfil y reputación visible.",
    },
    {
      icon: Percent,
      title: "Ofertas reales",
      description: "Descuentos calculados desde el catálogo activo.",
    },
    {
      icon: CreditCard,
      title: "Pagos preparados",
      description: "Arquitectura lista para integrar checkout.",
    },
    {
      icon: ShieldCheck,
      title: "Datos protegidos",
      description: "Autenticación y políticas RLS en Supabase.",
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-white py-6" id="beneficios">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <BenefitItem
              description={item.description}
              icon={item.icon}
              key={item.title}
              title={item.title}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
          {features.map((feature) => (
            <StatPill
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

function BenefitItem({
  description,
  icon: Icon,
  title,
}: Readonly<{
  title: string;
  description: string;
  icon: LucideIcon;
}>) {
  return (
    <div className="flex gap-3 rounded-sm border border-slate-100 bg-slate-50/80 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-dark">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-xs leading-5 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function StatPill({
  description,
  icon,
  title,
}: Readonly<{
  title: string;
  description: string;
  icon: LandingHomeFeatureIcon;
}>) {
  const Icon = featureIcons[icon];

  return (
    <div className="flex items-start gap-2 rounded-sm bg-[#eaeded] px-3 py-2.5">
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
    </div>
  );
}
