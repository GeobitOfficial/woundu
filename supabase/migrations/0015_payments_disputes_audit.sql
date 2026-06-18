-- Pagos guiados: reembolsos en pedidos, disputas y auditoría de acciones Super Admin.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_dispute_status') then
    create type public.order_dispute_status as enum (
      'open',
      'under_review',
      'approved_refund',
      'rejected',
      'closed'
    );
  end if;
end $$;

alter table public.orders
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_amount numeric(12, 2)
    check (refund_amount is null or refund_amount >= 0),
  add column if not exists refund_reason text
    check (refund_reason is null or char_length(refund_reason) <= 500);

create table if not exists public.order_disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete restrict,
  status public.order_dispute_status not null default 'open',
  reason text not null check (char_length(reason) between 10 and 500),
  buyer_note text check (buyer_note is null or char_length(buyer_note) <= 1000),
  admin_note text check (admin_note is null or char_length(admin_note) <= 1000),
  refund_amount numeric(12, 2) check (refund_amount is null or refund_amount >= 0),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_disputes_order_id_idx
  on public.order_disputes (order_id, created_at desc);

create index if not exists order_disputes_status_idx
  on public.order_disputes (status, created_at desc);

drop trigger if exists set_order_disputes_updated_at on public.order_disputes;
create trigger set_order_disputes_updated_at
before update on public.order_disputes
for each row execute function public.set_updated_at();

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  action text not null check (char_length(action) between 3 and 80),
  entity_type text not null check (char_length(entity_type) between 2 and 60),
  entity_id text not null check (char_length(entity_id) between 1 and 120),
  summary text not null check (char_length(summary) between 3 and 500),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

create index if not exists admin_audit_logs_action_idx
  on public.admin_audit_logs (action, created_at desc);

create index if not exists admin_audit_logs_entity_idx
  on public.admin_audit_logs (entity_type, entity_id);

alter table public.order_disputes enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "Buyers create own order disputes" on public.order_disputes;
create policy "Buyers create own order disputes"
on public.order_disputes for insert
with check (
  opened_by = auth.uid()
  and public.is_not_banned()
  and exists (
    select 1
    from public.orders o
    where o.id = order_disputes.order_id
      and o.buyer_id = auth.uid()
  )
);

drop policy if exists "Buyers read own order disputes" on public.order_disputes;
create policy "Buyers read own order disputes"
on public.order_disputes for select
using (
  opened_by = auth.uid()
  or exists (
    select 1
    from public.orders o
    where o.id = order_disputes.order_id
      and o.buyer_id = auth.uid()
  )
);

drop policy if exists "Super admins manage order disputes" on public.order_disputes;
create policy "Super admins manage order disputes"
on public.order_disputes for all
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Super admins read audit logs" on public.admin_audit_logs;
create policy "Super admins read audit logs"
on public.admin_audit_logs for select
using (public.is_super_admin());

drop policy if exists "Super admins insert audit logs" on public.admin_audit_logs;
create policy "Super admins insert audit logs"
on public.admin_audit_logs for insert
with check (
  public.is_super_admin()
  and actor_id = auth.uid()
);
