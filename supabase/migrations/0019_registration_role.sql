-- Rol elegido en registro (comprador o vendedor) desde metadata de auth.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  signup_role public.user_role;
begin
  signup_role := case
    when coalesce(new.raw_user_meta_data ->> 'role', '') = 'seller'
      then 'seller'::public.user_role
    else 'buyer'::public.user_role
  end;

  insert into public.profiles (id, full_name, avatar_url, email, country, currency, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Usuario Woundu'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'country'), ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'currency'), ''), 'USD'),
    signup_role
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
