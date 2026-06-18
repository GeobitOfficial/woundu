import Link from "next/link";
import {
  CreditCard,
  Globe,
  LayoutGrid,
  LifeBuoy,
  MessageSquare,
  Package,
  Receipt,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getRoleLabel } from "@/lib/auth/roles";

export type AdminNavKey =
  | "overview"
  | "categories"
  | "products"
  | "users"
  | "orders"
  | "payments"
  | "support"
  | "reviews"
  | "countries"
  | "audit";
type AdminShellProps = Readonly<{
  activeNav: AdminNavKey;
  children: React.ReactNode;
  profileName: string;
  role: string;
}>;

const NAV_ITEMS: ReadonlyArray<{
  key: AdminNavKey;
  href: string;
  icon: typeof LayoutGrid;
  label: string;
}> = [
  { key: "overview", href: "/admin", icon: ShieldCheck, label: "Resumen" },
  { key: "categories", href: "/admin/categorias", icon: LayoutGrid, label: "Categorías" },
  { key: "products", href: "/admin/productos", icon: Package, label: "Productos" },
  { key: "users", href: "/admin/usuarios", icon: Users, label: "Usuarios" },
  { key: "orders", href: "/admin/ordenes", icon: Receipt, label: "Compras" },
  { key: "payments", href: "/admin/pagos", icon: CreditCard, label: "Pagos" },
  { key: "support", href: "/admin/soporte", icon: LifeBuoy, label: "Soporte" },
  { key: "reviews", href: "/admin/resenas", icon: MessageSquare, label: "Reseñas" },
  {
    key: "countries",
    href: "/admin/paises",
    icon: Globe,
    label: "Países",
  },
  { key: "audit", href: "/admin/auditoria", icon: ScrollText, label: "Auditoría" },
];
export function AdminShell({
  activeNav,
  children,
  profileName,
  role,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="border-b border-slate-200 bg-[#131921] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              Panel Super Admin
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Administración Woundu
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {profileName} · {getRoleLabel(role as never)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              href="/marketplace"
            >
              Ver marketplace
            </Link>
            <Link
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-hover"
              href="/"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav aria-label="Administración" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <AdminNavLink
                active={activeNav === item.key}
                href={item.href}
                icon={item.icon}
                key={item.key}
                label={item.label}
              />
            ))}
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}

function AdminNavLink({
  active,
  href,
  icon: Icon,
  label,
}: Readonly<{
  active: boolean;
  href: string;
  icon: typeof LayoutGrid;
  label: string;
}>) {
  return (
    <Link
      className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-brand-light text-brand-dark"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
      }`}
      href={href}
    >
      <span className="inline-flex items-center gap-2">
        <Icon aria-hidden="true" className="h-4 w-4" />
        {label}
      </span>
    </Link>
  );
}
