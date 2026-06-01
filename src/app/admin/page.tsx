import Link from "next/link";
import {
  LayoutGrid,
  LifeBuoy,
  Package,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";

import { getAdminDashboardStats } from "@/features/admin/services/adminReadService";

export default async function AdminOverviewPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          Control total de la plataforma
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Centro de operaciones Super Admin
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Gestiona categorías, modera productos, administra usuarios y consulta el
          registro de compras con datos reales de Supabase.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Productos totales" value={String(stats.totalProducts)} />
        <StatCard label="Pendientes de revisión" value={String(stats.pendingProducts)} />
        <StatCard label="Usuarios registrados" value={String(stats.totalUsers)} />
        <StatCard label="Operaciones registradas" value={String(stats.totalOrders)} />
        <StatCard label="Tickets abiertos" value={String(stats.openSupportTickets)} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          description="Crea y organiza las categorías visibles en el marketplace."
          href="/admin/categorias"
          icon={LayoutGrid}
          title="Categorías"
        />
        <ActionCard
          description="Aprueba, rechaza o edita publicaciones y sus estados."
          href="/admin/productos"
          icon={Package}
          title="Productos"
        />
        <ActionCard
          description="Consulta cuentas, banea usuarios y revisa roles."
          href="/admin/usuarios"
          icon={Users}
          title="Usuarios"
        />
        <ActionCard
          description="Historial de compras con comprador, vendedor, producto y lugar."
          href="/admin/ordenes"
          icon={Receipt}
          title="Compras"
        />
        <ActionCard
          description="Responde tickets de usuarios y gestiona estados de soporte."
          href="/admin/soporte"
          icon={LifeBuoy}
          title="Soporte"
        />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function ActionCard({
  description,
  href,
  icon: Icon,
  title,
}: Readonly<{
  description: string;
  href: string;
  icon: typeof LayoutGrid;
  title: string;
}>) {
  return (
    <Link
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand/30 hover:shadow-md"
      href={href}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand-dark transition group-hover:bg-brand group-hover:text-white">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}
