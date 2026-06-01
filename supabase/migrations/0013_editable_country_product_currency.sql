-- País editable en perfil y moneda derivada por país en perfil y productos.

create table if not exists public.marketplace_country_currencies (
  country text primary key,
  currency text not null check (char_length(currency) = 3)
);

insert into public.marketplace_country_currencies (country, currency)
values
  ('Antigua y Barbuda', 'XCD'),
  ('Argentina', 'ARS'),
  ('Bahamas', 'BSD'),
  ('Barbados', 'BBD'),
  ('Belice', 'BZD'),
  ('Bolivia', 'BOB'),
  ('Brasil', 'BRL'),
  ('Chile', 'CLP'),
  ('Colombia', 'COP'),
  ('Costa Rica', 'CRC'),
  ('Cuba', 'CUP'),
  ('Dominica', 'XCD'),
  ('Ecuador', 'USD'),
  ('El Salvador', 'USD'),
  ('Estados Unidos', 'USD'),
  ('Granada', 'XCD'),
  ('Guatemala', 'GTQ'),
  ('Guyana', 'GYD'),
  ('Haití', 'HTG'),
  ('Honduras', 'HNL'),
  ('Jamaica', 'JMD'),
  ('México', 'MXN'),
  ('Nicaragua', 'NIO'),
  ('Panamá', 'USD'),
  ('Paraguay', 'PYG'),
  ('Perú', 'PEN'),
  ('República Dominicana', 'DOP'),
  ('San Cristóbal y Nieves', 'XCD'),
  ('San Vicente y las Granadinas', 'XCD'),
  ('Santa Lucía', 'XCD'),
  ('Surinam', 'SRD'),
  ('Trinidad y Tobago', 'TTD'),
  ('Uruguay', 'UYU'),
  ('Venezuela', 'VES')
on conflict (country) do update
set currency = excluded.currency;

create or replace function public.resolve_currency_for_country(p_country text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select currency
  from public.marketplace_country_currencies
  where country = nullif(trim(p_country), '');
$$;

create or replace function public.protect_profile_locale()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_currency text;
begin
  if auth.uid() is not null and not public.is_super_admin() then
    if old.country is distinct from new.country then
      resolved_currency := public.resolve_currency_for_country(new.country);
      if resolved_currency is not null then
        new.currency := resolved_currency;
      end if;
    elsif old.currency is distinct from new.currency then
      new.currency := old.currency;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_product_country_currency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_currency text;
  seller_country text;
begin
  if new.country is not null and btrim(new.country) <> '' then
    resolved_currency := public.resolve_currency_for_country(new.country);
    if resolved_currency is not null then
      new.currency := resolved_currency;
    end if;
  elsif tg_op = 'INSERT' then
    select p.country
    into seller_country
    from public.profiles p
    where p.id = new.seller_id;

    if seller_country is not null and btrim(seller_country) <> '' then
      new.country := seller_country;
      resolved_currency := public.resolve_currency_for_country(new.country);
      if resolved_currency is not null then
        new.currency := resolved_currency;
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_seller_product_currency on public.products;
drop trigger if exists trg_enforce_product_country_currency on public.products;

create trigger trg_enforce_product_country_currency
before insert or update of country on public.products
for each row
execute function public.enforce_product_country_currency();

alter table public.marketplace_country_currencies enable row level security;

drop policy if exists "Country currencies are readable" on public.marketplace_country_currencies;
create policy "Country currencies are readable"
on public.marketplace_country_currencies for select
using (true);
