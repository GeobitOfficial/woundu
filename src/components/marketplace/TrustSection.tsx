import { LockKeyhole, ShieldCheck } from "lucide-react";

import type { LandingHomeCopy } from "@/features/products";

type TrustSectionProps = Readonly<{
  trust: LandingHomeCopy["trust"];
}>;

export function TrustSection({ trust }: TrustSectionProps) {
  return (
    <section
      className="border-y border-violet-100/50 bg-gradient-to-b from-cyan-50/50 via-violet-50/30 to-emerald-50/50 py-20"
      id="confianza"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck aria-hidden="true" className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
                {trust.headline}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                {trust.subheadline}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-emerald-950">
                  <LockKeyhole aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{trust.asideTitle}</p>
                  <p className="font-bold">{trust.asideSubtitle}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-4">
                {trust.bullets.map((item) => (
                  <li className="flex gap-3 text-sm text-slate-200" key={item}>
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
