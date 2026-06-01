-- País y moneda del vendedor según registro en la plataforma.

alter table public.profiles
  add column if not exists country text,
  add column if not exists currency text not null default 'USD'
    check (char_length(currency) = 3);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, country, currency)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Usuario Woundu'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'country'), ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'currency'), ''), 'USD')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    country = coalesce(public.profiles.country, excluded.country),
    currency = coalesce(public.profiles.currency, excluded.currency),
    updated_at = now();

  return new;
end;
$$;

create or replace function public.protect_profile_locale()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.country is distinct from new.country
     or old.currency is distinct from new.currency then
    if auth.uid() is not null and not public.is_super_admin() then
      new.country := old.country;
      new.currency := old.currency;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_locale on public.profiles;
create trigger trg_protect_profile_locale
before update on public.profiles
for each row
execute function public.protect_profile_locale();

create or replace function public.enforce_seller_product_currency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seller_currency text;
  seller_country text;
begin
  select p.currency, p.country
  into seller_currency, seller_country
  from public.profiles p
  where p.id = new.seller_id;

  if seller_currency is not null then
    new.currency := seller_currency;
  end if;

  if seller_country is not null and (new.country is null or btrim(new.country) = '') then
    new.country := seller_country;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_seller_product_currency on public.products;
create trigger trg_enforce_seller_product_currency
before insert on public.products
for each row
execute function public.enforce_seller_product_currency();
