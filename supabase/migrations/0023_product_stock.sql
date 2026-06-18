-- Inventario disponible por publicación (unidades en venta).

alter table public.products
  add column if not exists stock integer not null default 1 check (stock >= 0);

create or replace function public.is_active_product_for_seller(
  p_product_id uuid,
  p_seller_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.products p
    where p.id = p_product_id
      and p.seller_id = p_seller_id
      and p.status = 'active'::public.product_status
      and p.stock > 0
      and p.deleted_at is null
  );
$$;

create or replace function public.decrement_product_stock_on_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_rows integer;
begin
  update public.products
  set
    stock = stock - new.quantity,
    status = case
      when stock - new.quantity <= 0 then 'sold'::public.product_status
      else status
    end,
    updated_at = now()
  where id = new.product_id
    and stock >= new.quantity
    and status = 'active'::public.product_status
    and deleted_at is null;

  get diagnostics updated_rows = row_count;

  if updated_rows = 0 then
    raise exception 'PRODUCT_OUT_OF_STOCK' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_decrement_product_stock_on_order_item on public.order_items;
create trigger trg_decrement_product_stock_on_order_item
after insert on public.order_items
for each row
execute function public.decrement_product_stock_on_order_item();

create or replace function public.restore_product_stock_on_order_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled'::public.order_status
     and old.status is distinct from 'cancelled'::public.order_status
     and old.status in (
       'pending'::public.order_status,
       'paid'::public.order_status
     ) then
    update public.products p
    set
      stock = p.stock + oi.quantity,
      status = case
        when p.status = 'sold'::public.product_status
          and p.stock + oi.quantity > 0
          then 'active'::public.product_status
        else p.status
      end,
      updated_at = now()
    from public.order_items oi
    where oi.order_id = new.id
      and oi.product_id = p.id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_restore_product_stock_on_order_cancel on public.orders;
create trigger trg_restore_product_stock_on_order_cancel
after update of status on public.orders
for each row
execute function public.restore_product_stock_on_order_cancel();

create or replace function public.sync_product_status_from_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stock > 0
     and old.status = 'sold'::public.product_status
     and new.status = old.status then
    new.status := 'active'::public.product_status;
  elsif new.stock <= 0
     and old.status = 'active'::public.product_status then
    new.status := 'sold'::public.product_status;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_product_status_from_stock on public.products;
create trigger trg_sync_product_status_from_stock
before update of stock on public.products
for each row
execute function public.sync_product_status_from_stock();
