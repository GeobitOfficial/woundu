import Link from "next/link";
import {
  AlertTriangle,
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
          Gestiona categorías, modera productos, administra usuarios, monedas por
          país, reseñas y consulta el registro de compras con datos reales de
          Supabase.
        </p>
      </section>

      {(stats.pendingProducts > 0 || stats.openSupportTickets > 0) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {stats.pendingProducts > 0 ? (
            <AlertCard
              description={`${stats.pendingProducts} publicación(es) esperan revisión.`}
              href="/admin/productos"
              icon={Package}
              title="Productos pendientes"
            />
          ) : null}
          {stats.openSupportTickets > 0 ? (
            <AlertCard
              description={`${stats.openSupportTickets} ticket(s) requieren atención.`}
              href="/admin/soporte"
              icon={LifeBuoy}
              title="Soporte activo"
            />
          ) : null}
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Catálogo
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Productos totales" value={String(stats.totalProducts)} />
          <StatCard
            highlight={stats.pendingProducts > 0}
            label="Pendientes de revisión"
            value={String(stats.pendingProducts)}
          />
          <StatCard label="Disponibles" value={String(stats.activeProducts)} />
          <StatCard label="Rechazados" value={String(stats.rejectedProducts)} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Comunidad y operaciones
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Usuarios registrados" value={String(stats.totalUsers)} />
          <StatCard label="Compradores" value={String(stats.buyerUsers)} />
          <StatCard label="Vendedores" value={String(stats.sellerUsers)} />
          <StatCard label="Usuarios baneados" value={String(stats.bannedUsers)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Operaciones totales" value={String(stats.totalOrders)} />
          <StatCard label="Compras completadas" value={String(stats.completedOrders)} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Soporte
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            highlight={stats.openSupportTickets > 0}
            label="Tickets abiertos"
            value={String(stats.openSupportTickets)}
          />
          <StatCard label="Tickets totales" value={String(stats.totalSupportTickets)} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          description="Crea y organiza las categorías visibles en el marketplace."
          href="/admin/categorias"
          icon={LayoutGrid}
          title="Categorías"
        />
        <ActionCard
          badge={stats.pendingProducts > 0 ? String(stats.pendingProducts) : undefined}
          description="Aprueba, rechaza o edita publicaciones y sus estados."
          href="/admin/productos"
          icon={Package}
          title="Productos"
        />
        <ActionCard
          description="Consulta cuentas, cambia roles, banea usuarios y edita país."
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
          description="Confirma pagos, gestiona disputas y procesa reembolsos guiados."
          href="/admin/pagos"
          icon={CreditCard}
          title="Pagos y reembolsos"
        />
        <ActionCard
          badge={
            stats.openSupportTickets > 0
              ? String(stats.openSupportTickets)
              : undefined
          }
          description="Responde tickets de usuarios y gestiona estados de soporte."
          href="/admin/soporte"
          icon={LifeBuoy}
          title="Soporte"
        />
        <ActionCard
          description="Consulta y elimina reseñas inapropiadas del marketplace."
          href="/admin/resenas"
          icon={MessageSquare}
          title="Reseñas"
        />
        <ActionCard
          description="Configura la moneda asociada a cada país del marketplace."
          href="/admin/paises"
          icon={Globe}
          title="Países y monedas"
        />
        <ActionCard
          description="Consulta el historial de acciones realizadas por Super Admin."
          href="/admin/auditoria"
          icon={ScrollText}
          title="Auditoría"
        />
      </section>
    </div>
  );
}

function StatCard({
  highlight = false,
  label,
  value,
}: Readonly<{
  highlight?: boolean;
  label: string;
  value: string;
}>) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        highlight ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function AlertCard({
  description,
  href,
  icon: Icon,
  title,
}: Readonly<{
  description: string;
  href: string;
  icon: typeof Package;
  title: string;
}>) {
  return (
    <Link
      className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:border-amber-300 hover:bg-amber-100/80"
      href={href}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
        <AlertTriangle aria-hidden="true" className="h-5 w-5" />
      </span>
      <span>
        <span className="flex items-center gap-2 text-sm font-bold text-amber-950">
          <Icon aria-hidden="true" className="h-4 w-4" />
          {title}
        </span>
        <span className="mt-1 block text-sm text-amber-900">{description}</span>
      </span>
    </Link>
  );
}

function ActionCard({
  badge,
  description,
  href,
  icon: Icon,
  title,
}: Readonly<{
  badge?: string;
  description: string;
  href: string;
  icon: typeof LayoutGrid;
  title: string;
}>) {
  return (
    <Link
      className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand/30 hover:shadow-md"
      href={href}
    >
      {badge ? (
        <span className="absolute right-4 top-4 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-2 text-xs font-bold text-white">
          {badge}
        </span>
      ) : null}
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand-dark transition group-hover:bg-brand group-hover:text-white">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}
