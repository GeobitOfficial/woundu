import Link from "next/link";
import { ShieldCheck, Store, TrendingUp } from "lucide-react";

import { buttonVariants } from "@/components/ui";
import type { LandingHomeCopy } from "@/features/products";
import { cn } from "@/lib/utils";

type TrustSectionProps = Readonly<{
  trust: LandingHomeCopy["trust"];
}>;

export function TrustSection({ trust }: TrustSectionProps) {
  return (
    <section className="pb-10 pt-2" id="confianza">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
            <TrustSellerPanel trust={trust} />
          </div>
          <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
            <TrustBuyerPanel trust={trust} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSellerPanel({
  trust,
}: Readonly<{ trust: LandingHomeCopy["trust"] }>) {
  return (
    <div className="flex h-full flex-col p-6 sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted text-brand-dark">
        <Store aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-950 sm:text-2xl">
        Vende en Woundu
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Publica productos, llega a compradores en Latinoamérica y construye
        reputación con reseñas reales.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {trust.bullets.map((item) => (
          <li className="flex gap-2" key={item}>
            <TrendingUp
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-brand"
            />
            {item}
          </li>
        ))}
      </ul>
      <Link
        className={cn(
          buttonVariants({ className: "mt-6 w-full sm:w-auto", variant: "primary" }),
        )}
        href="/publicar"
      >
        Empezar a vender
      </Link>
    </div>
  );
}

function TrustBuyerPanel({
  trust,
}: Readonly<{ trust: LandingHomeCopy["trust"] }>) {
  return (
    <div className="flex h-full flex-col bg-[#232f3e] p-6 text-white sm:p-8">
      <TrustBuyerPanelHeader />
      <h2 className="mt-4 text-xl font-bold sm:text-2xl">{trust.headline}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{trust.subheadline}</p>
      <div className="mt-6 rounded-sm border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          {trust.asideTitle}
        </p>
        <p className="mt-1 font-bold">{trust.asideSubtitle}</p>
      </div>
      <Link
        className={cn(
          buttonVariants({ className: "mt-6 w-full sm:w-auto", variant: "secondary" }),
          "border-white/20 bg-white text-slate-900 hover:bg-slate-100",
        )}
        href="/marketplace"
      >
        Ir al marketplace
      </Link>
    </div>
  );
}

function TrustBuyerPanelHeader() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
      <ShieldCheck aria-hidden="true" className="h-6 w-6 text-brand" />
    </div>
  );
}
