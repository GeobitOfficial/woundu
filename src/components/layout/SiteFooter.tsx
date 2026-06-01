import Link from "next/link";

import { BRAND_NAME } from "@/constants/branding";
import { NAV_ITEMS } from "@/constants/landing";

const FOOTER_LINKS = [
  ...NAV_ITEMS,
  { label: "Publicar", href: "/publicar" },
  { label: "Iniciar sesion", href: "/login" },
  { label: "Registro", href: "/registro" },
  { label: "Mi cuenta", href: "/cuenta" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-black tracking-tight text-white">
              {BRAND_NAME}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Marketplace moderno para comprar, vender y descubrir productos
              con confianza.
            </p>
          </div>

          <nav aria-label="Enlaces del pie de pagina">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Enlaces
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
              {FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-sm font-medium text-slate-300 transition hover:text-brand"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>
            © {year} {BRAND_NAME}. Todos los derechos reservados.
          </p>
          <p className="text-slate-500">
            Not FDA evaluated; not intended to diagnose, treat, cure, prevent disease.
          </p>
        </div>
      </div>
    </footer>
  );
}
