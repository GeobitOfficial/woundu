import Link from "next/link";
import {
  ArrowRight,
  Filter,
  MapPinned,
  ShieldCheck,
  Store,
} from "lucide-react";

import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

const BENEFITS = [
  {
    icon: MapPinned,
    title: "Contexto local claro",
    description:
      "Cada publicación indica su país de origen para que compres y vendas con referencias geográficas coherentes.",
  },
  {
    icon: Filter,
    title: "Filtros que funcionan",
    description:
      "Al elegir un país, el marketplace aplica el filtro automáticamente junto con categoría, precio y ofertas.",
  },
  {
    icon: ShieldCheck,
    title: "Catálogo ordenado",
    description:
      "Evita mezclar mercados distintos en una sola vista y facilita descubrir productos relevantes para tu zona.",
  },
] as const;

export function CountriesBenefitsSection() {
  return (
    <section className="pb-4 pt-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <BenefitCard benefit={benefit} key={benefit.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({
  benefit,
}: Readonly<{
  benefit: (typeof BENEFITS)[number];
}>) {
  const Icon = benefit.icon;

  return (
    <article className="h-full rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-muted text-brand-dark">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{benefit.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {benefit.description}
      </p>
    </article>
  );
}

export function CountriesCallToAction() {
  return (
    <section className="pb-12 pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-muted">
                <Store aria-hidden="true" className="h-3.5 w-3.5" />
                Tu mercado, tu alcance
              </p>
              <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                ¿Listo para vender en tu país?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Publica productos asociados a tu país, llega a compradores de la
                región y ayuda a construir un catálogo regional sólido en Woundu.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                className={cn(
                  buttonVariants({
                    className: "w-full sm:w-auto lg:w-full xl:w-auto",
                    size: "lg",
                    variant: "primary",
                  }),
                )}
                href="/publicar"
              >
                Publicar producto
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className={cn(
                  buttonVariants({
                    className:
                      "w-full border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/15 sm:w-auto lg:w-full xl:w-auto",
                    size: "lg",
                    variant: "secondary",
                  }),
                )}
                href="/marketplace"
              >
                Explorar marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
