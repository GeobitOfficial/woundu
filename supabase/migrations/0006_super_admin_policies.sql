-- PASO 2 de 2 — Ejecutar DESPUÉS de 0005_super_admin_role_enum.sql (en otra query / otra ejecución).

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'::public.user_role
      and deleted_at is null
  );
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role then
    if auth.uid() is not null and not public.is_super_admin() then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
before update on public.profiles
for each row
execute function public.protect_profile_role();

drop policy if exists "Admins can manage categories" on public.categories;

drop policy if exists "Super admins can manage categories" on public.categories;
create policy "Super admins can manage categories"
on public.categories for all
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Super admins can read all categories" on public.categories;
create policy "Super admins can read all categories"
on public.categories for select
using (public.is_super_admin());
