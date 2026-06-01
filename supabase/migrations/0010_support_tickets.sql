-- PASO 1 — Ejecutar en Supabase SQL Editor (después de 0009).

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'support_ticket_status'
  ) then
    create type public.support_ticket_status as enum (
      'open',
      'in_progress',
      'waiting_user',
      'resolved',
      'closed'
    );
  end if;
end $$;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  status public.support_ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  closed_at timestamptz,
  last_message_at timestamptz not null default now()
);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  is_staff_reply boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_user_id_idx
  on public.support_tickets (user_id);

create index if not exists support_tickets_status_idx
  on public.support_tickets (status);

create index if not exists support_tickets_last_message_at_idx
  on public.support_tickets (last_message_at desc);

create index if not exists support_ticket_messages_ticket_id_idx
  on public.support_ticket_messages (ticket_id, created_at asc);

drop trigger if exists set_support_tickets_updated_at on public.support_tickets;
create trigger set_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.set_updated_at();

create or replace function public.handle_support_ticket_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'resolved'::public.support_ticket_status
     and old.status is distinct from 'resolved'::public.support_ticket_status then
    new.resolved_at := coalesce(new.resolved_at, now());
  end if;

  if new.status = 'closed'::public.support_ticket_status
     and old.status is distinct from 'closed'::public.support_ticket_status then
    new.closed_at := coalesce(new.closed_at, now());
  end if;

  if new.status in (
    'open'::public.support_ticket_status,
    'in_progress'::public.support_ticket_status,
    'waiting_user'::public.support_ticket_status
  ) and old.status in (
    'resolved'::public.support_ticket_status,
    'closed'::public.support_ticket_status
  ) then
    new.resolved_at := null;
    new.closed_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists support_ticket_status_change on public.support_tickets;
create trigger support_ticket_status_change
before update of status on public.support_tickets
for each row execute function public.handle_support_ticket_status_change();

create or replace function public.handle_support_ticket_message_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_tickets
  set
    last_message_at = new.created_at,
    updated_at = now()
  where id = new.ticket_id;

  return new;
end;
$$;

drop trigger if exists support_ticket_message_insert on public.support_ticket_messages;
create trigger support_ticket_message_insert
after insert on public.support_ticket_messages
for each row execute function public.handle_support_ticket_message_insert();

alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;

drop policy if exists "Users create own support tickets" on public.support_tickets;
create policy "Users create own support tickets"
on public.support_tickets
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.is_not_banned()
);

drop policy if exists "Users read own support tickets" on public.support_tickets;
create policy "Users read own support tickets"
on public.support_tickets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Super admins manage support tickets" on public.support_tickets;
create policy "Super admins manage support tickets"
on public.support_tickets
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Users read messages on own tickets" on public.support_ticket_messages;
create policy "Users read messages on own tickets"
on public.support_ticket_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_tickets ticket
    where ticket.id = ticket_id
      and ticket.user_id = auth.uid()
  )
);

drop policy if exists "Users reply on own open tickets" on public.support_ticket_messages;
create policy "Users reply on own open tickets"
on public.support_ticket_messages
for insert
to authenticated
with check (
  auth.uid() = author_id
  and is_staff_reply = false
  and public.is_not_banned()
  and exists (
    select 1
    from public.support_tickets ticket
    where ticket.id = ticket_id
      and ticket.user_id = auth.uid()
      and ticket.status in (
        'open'::public.support_ticket_status,
        'in_progress'::public.support_ticket_status,
        'waiting_user'::public.support_ticket_status
      )
  )
);

drop policy if exists "Super admins read support messages" on public.support_ticket_messages;
create policy "Super admins read support messages"
on public.support_ticket_messages
for select
to authenticated
using (public.is_super_admin());

drop policy if exists "Super admins reply on support tickets" on public.support_ticket_messages;
create policy "Super admins reply on support tickets"
on public.support_ticket_messages
for insert
to authenticated
with check (
  public.is_super_admin()
  and auth.uid() = author_id
  and is_staff_reply = true
);
