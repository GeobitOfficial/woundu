-- Cobro directo vendedor + flujo de pedidos offline (sin pasarela).

create table if not exists public.seller_payout_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  payment_method text check (payment_method is null or char_length(payment_method) <= 80),
  bank_name text check (bank_name is null or char_length(bank_name) <= 120),
  account_holder text check (account_holder is null or char_length(account_holder) <= 120),
  account_number text check (account_number is null or char_length(account_number) <= 120),
  payment_instructions text check (
    payment_instructions is null or char_length(payment_instructions) <= 1000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_seller_payout_profiles_updated_at on public.seller_payout_profiles;
create trigger set_seller_payout_profiles_updated_at
before update on public.seller_payout_profiles
for each row execute function public.set_updated_at();

alter table public.seller_payout_profiles enable row level security;

drop policy if exists "Sellers manage own payout profile" on public.seller_payout_profiles;
create policy "Sellers manage own payout profile"
on public.seller_payout_profiles for all
using (user_id = auth.uid())
with check (user_id = auth.uid() and public.is_not_banned());

drop policy if exists "Buyers read seller payout for their orders" on public.seller_payout_profiles;
create policy "Buyers read seller payout for their orders"
on public.seller_payout_profiles for select
using (
  user_id = auth.uid()
  or public.is_super_admin()
  or exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.seller_id = seller_payout_profiles.user_id
      and o.buyer_id = auth.uid()
      and o.status not in ('cancelled', 'refunded')
  )
);

drop policy if exists "Super admins manage payout profiles" on public.seller_payout_profiles;
create policy "Super admins manage payout profiles"
on public.seller_payout_profiles for all
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Buyers can update pending own orders" on public.orders;
create policy "Buyers can update own open orders"
on public.orders for update
using (
  buyer_id = auth.uid()
  and status in ('pending', 'paid')
  and public.is_not_banned()
)
with check (buyer_id = auth.uid());

drop policy if exists "Sellers update orders with their products" on public.orders;
create policy "Sellers update orders with their products"
on public.orders for update
using (
  public.is_not_banned()
  and exists (
    select 1
    from public.order_items oi
    where oi.order_id = orders.id
      and oi.seller_id = auth.uid()
  )
  and status in ('pending', 'paid', 'processing')
)
with check (
  exists (
    select 1
    from public.order_items oi
    where oi.order_id = orders.id
      and oi.seller_id = auth.uid()
  )
);
