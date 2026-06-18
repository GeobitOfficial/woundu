-- Permite al vendedor marcar su producto como vendido al completar un pedido.

create or replace function public.protect_product_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    if auth.uid() is not null and not public.is_super_admin() then
      if not (
        new.status = 'sold'::public.product_status
        and new.seller_id = auth.uid()
        and old.status = 'active'::public.product_status
      ) then
        new.status := old.status;
      end if;
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
