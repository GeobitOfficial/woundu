-- PASO 2 — Ejecutar después de 0008_product_moderation_status_enum.sql

alter table public.profiles
  add column if not exists email text,
  add column if not exists is_banned boolean not null default false,
  add column if not exists banned_at timestamptz,
  add column if not exists ban_reason text;

alter table public.products
  add column if not exists moderation_note text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

create or replace function public.is_not_banned()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_banned = true
      and deleted_at is null
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Usuario Woundu'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  )
  on conflict (id) do update
  set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

update public.profiles profile
set email = auth_user.email
from auth.users auth_user
where profile.id = auth_user.id
  and profile.email is distinct from auth_user.email;

create or replace function public.protect_product_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    if auth.uid() is not null and not public.is_super_admin() then
      new.status := old.status;
    end if;
  end if;

  if new.status = 'active'::public.product_status
     and old.status is distinct from 'active'::public.product_status then
    new.published_at := coalesce(new.published_at, now());
    new.reviewed_at := now();
    new.reviewed_by := auth.uid();
  end if;

  if new.status = 'rejected'::public.product_status
     and old.status is distinct from 'rejected'::public.product_status then
    new.reviewed_at := now();
    new.reviewed_by := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_product_status on public.products;
create trigger trg_protect_product_status
before update on public.products
for each row
execute function public.protect_product_status();

drop policy if exists "Users can create own products" on public.products;
create policy "Users can create own products"
on public.products for insert
with check (
  seller_id = auth.uid()
  and public.is_not_banned()
);

drop policy if exists "Buyers can create own orders" on public.orders;
create policy "Buyers can create own orders"
on public.orders for insert
with check (
  buyer_id = auth.uid()
  and public.is_not_banned()
);

drop policy if exists "Super admins manage all products" on public.products;
create policy "Super admins manage all products"
on public.products for all
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Super admins read all profiles" on public.profiles;
create policy "Super admins read all profiles"
on public.profiles for select
using (public.is_super_admin());

drop policy if exists "Super admins update profiles" on public.profiles;
create policy "Super admins update profiles"
on public.profiles for update
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Super admins read all orders" on public.orders;
create policy "Super admins read all orders"
on public.orders for select
using (public.is_super_admin());

drop policy if exists "Super admins read all order items" on public.order_items;
create policy "Super admins read all order items"
on public.order_items for select
using (public.is_super_admin());

drop policy if exists "Super admins update orders" on public.orders;
create policy "Super admins update orders"
on public.orders for update
using (public.is_super_admin())
with check (public.is_super_admin());
