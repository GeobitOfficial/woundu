-- Corrige el trigger que bloqueaba asignar super_admin desde el SQL Editor.
-- Ejecutar en Supabase SQL Editor (query separada).

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role then
    -- SQL Editor / service role: auth.uid() es null → permitir bootstrap inicial.
    if auth.uid() is not null and not public.is_super_admin() then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;
