-- Múltiples métodos de cobro por vendedor (cuenta bancaria y billeteras digitales).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'seller_payout_account_type') then
    create type public.seller_payout_account_type as enum (
      'savings',
      'checking',
      'digital_wallet'
    );
  end if;
end $$;

create table if not exists public.seller_payout_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_type public.seller_payout_account_type not null,
  entity_name text not null check (
    char_length(trim(entity_name)) >= 2
    and char_length(entity_name) <= 120
  ),
  account_number text not null check (
    char_length(trim(account_number)) >= 4
    and char_length(account_number) <= 120
  ),
  account_holder text not null check (
    char_length(trim(account_holder)) >= 2
    and char_length(account_holder) <= 120
  ),
  is_primary boolean not null default false,
  sort_order int not null default 0 check (sort_order >= 0 and sort_order <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seller_payout_methods_user_id_idx
  on public.seller_payout_methods (user_id, sort_order);

create unique index if not exists seller_payout_methods_one_primary_per_user_idx
  on public.seller_payout_methods (user_id)
  where is_primary = true;

drop trigger if exists set_seller_payout_methods_updated_at on public.seller_payout_methods;
create trigger set_seller_payout_methods_updated_at
before update on public.seller_payout_methods
for each row execute function public.set_updated_at();

insert into public.seller_payout_methods (
  user_id,
  account_type,
  entity_name,
  account_number,
  account_holder,
  is_primary,
  sort_order
)
select
  spp.user_id,
  case
    when lower(coalesce(spp.payment_method, '')) ~ '(nequi|daviplata|paypal|yape|plin|billetera|wallet|pse|zinli|mercadopago)'
      then 'digital_wallet'::public.seller_payout_account_type
    when lower(coalesce(spp.payment_method, '')) ~ '(corriente|checking)'
      then 'checking'::public.seller_payout_account_type
    else 'savings'::public.seller_payout_account_type
  end,
  coalesce(
    nullif(trim(spp.bank_name), ''),
    nullif(trim(spp.payment_method), ''),
    'Entidad bancaria'
  ),
  spp.account_number,
  spp.account_holder,
  true,
  0
from public.seller_payout_profiles spp
where spp.account_number is not null
  and nullif(trim(spp.account_number), '') is not null
  and spp.account_holder is not null
  and nullif(trim(spp.account_holder), '') is not null
  and not exists (
    select 1
    from public.seller_payout_methods spm
    where spm.user_id = spp.user_id
  );

alter table public.seller_payout_profiles
  drop column if exists payment_method,
  drop column if exists bank_name,
  drop column if exists account_holder,
  drop column if exists account_number;

alter table public.seller_payout_methods enable row level security;

drop policy if exists "Sellers manage own payout methods" on public.seller_payout_methods;
create policy "Sellers manage own payout methods"
on public.seller_payout_methods for all
using (user_id = auth.uid())
with check (user_id = auth.uid() and public.is_not_banned());

drop policy if exists "Authenticated users read seller payout methods" on public.seller_payout_methods;
create policy "Authenticated users read seller payout methods"
on public.seller_payout_methods for select
using (
  user_id = auth.uid()
  or public.is_super_admin()
  or auth.uid() is not null
);

drop policy if exists "Super admins manage payout methods" on public.seller_payout_methods;
create policy "Super admins manage payout methods"
on public.seller_payout_methods for all
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Buyers read seller payout for their orders" on public.seller_payout_profiles;
create policy "Authenticated users read seller payout instructions"
on public.seller_payout_profiles for select
using (
  user_id = auth.uid()
  or public.is_super_admin()
  or auth.uid() is not null
);
