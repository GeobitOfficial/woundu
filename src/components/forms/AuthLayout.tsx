import { type ReactNode } from "react";

type AuthLayoutProps = Readonly<{
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}>;

export function AuthLayout({
  children,
  description,
  eyebrow,
  title,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_-5%,rgba(52,211,153,0.28),transparent_42%),radial-gradient(circle_at_95%_25%,rgba(125,211,252,0.22),transparent_45%),linear-gradient(140deg,#ecfdf5_0%,#f0f9ff_45%,#ede9fe_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              {description}
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm shadow-slate-950/5">
              <p className="text-sm font-semibold text-slate-950">
                Tu espacio en Woundu
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Guarda favoritos, publica productos y gestiona tu actividad en
                un solo lugar.
              </p>
            </div>
          </section>

          <section
            aria-label="Formulario de autenticacion"
            className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur sm:p-8"
          >
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
