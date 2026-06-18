-- Notificaciones in-app para vendedores (nuevo pedido y pago por verificar).

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (char_length(type) between 1 and 64),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 500),
  href text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_notifications_user_created_idx
  on public.user_notifications (user_id, created_at desc);

create index if not exists user_notifications_user_unread_idx
  on public.user_notifications (user_id, created_at desc)
  where read_at is null;

alter table public.user_notifications enable row level security;

drop policy if exists "Users read own notifications" on public.user_notifications;
create policy "Users read own notifications"
on public.user_notifications for select
using (user_id = auth.uid());

drop policy if exists "Users update own notifications" on public.user_notifications;
create policy "Users update own notifications"
on public.user_notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.notify_seller_on_new_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer_name text;
  product_title text;
begin
  select p.full_name
  into buyer_name
  from public.orders o
  join public.profiles p on p.id = o.buyer_id
  where o.id = new.order_id;

  select pr.title
  into product_title
  from public.products pr
  where pr.id = new.product_id;

  insert into public.user_notifications (
    user_id,
    type,
    title,
    body,
    href,
    metadata
  )
  values (
    new.seller_id,
    'new_order',
    'Nuevo pedido',
    format(
      '%s pidió %s. Revisa el pedido y coordina el pago directo.',
      coalesce(buyer_name, 'Un comprador'),
      coalesce(product_title, 'tu producto')
    ),
    '/cuenta/pedidos/' || new.order_id::text,
    jsonb_build_object(
      'order_id', new.order_id,
      'product_id', new.product_id
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_seller_new_order on public.order_items;
create trigger trg_notify_seller_new_order
after insert on public.order_items
for each row
execute function public.notify_seller_on_new_order_item();

create or replace function public.notify_sellers_on_order_paid()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer_name text;
  seller_rec record;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if new.status <> 'paid'::public.order_status then
    return new;
  end if;

  select p.full_name
  into buyer_name
  from public.profiles p
  where p.id = new.buyer_id;

  for seller_rec in
    select distinct
      oi.seller_id,
      coalesce(pr.title, 'tu producto') as product_title
    from public.order_items oi
    left join public.products pr on pr.id = oi.product_id
    where oi.order_id = new.id
  loop
    insert into public.user_notifications (
      user_id,
      type,
      title,
      body,
      href,
      metadata
    )
    values (
      seller_rec.seller_id,
      'payment_to_verify',
      'Pago por verificar',
      format(
        '%s reportó el pago de %s. Confirma que recibiste el dinero.',
        coalesce(buyer_name, 'Un comprador'),
        seller_rec.product_title
      ),
      '/cuenta/pedidos/' || new.id::text,
      jsonb_build_object(
        'order_id', new.id,
        'status', new.status
      )
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_notify_sellers_order_paid on public.orders;
create trigger trg_notify_sellers_order_paid
after update of status on public.orders
for each row
execute function public.notify_sellers_on_order_paid();

insert into public.user_notifications (
  user_id,
  type,
  title,
  body,
  href,
  metadata
)
select distinct
  oi.seller_id,
  'payment_to_verify',
  'Pago por verificar',
  format(
    '%s reportó el pago de %s. Confirma que recibiste el dinero.',
    coalesce(buyer.full_name, 'Un comprador'),
    coalesce(pr.title, 'tu producto')
  ),
  '/cuenta/pedidos/' || o.id::text,
  jsonb_build_object('order_id', o.id, 'status', o.status)
from public.orders o
join public.order_items oi on oi.order_id = o.id
left join public.products pr on pr.id = oi.product_id
left join public.profiles buyer on buyer.id = o.buyer_id
where o.status = 'paid'::public.order_status
  and not exists (
    select 1
    from public.user_notifications n
    where n.user_id = oi.seller_id
      and n.type = 'payment_to_verify'
      and n.metadata ->> 'order_id' = o.id::text
  );
