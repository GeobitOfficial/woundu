-- Rompe ciclos RLS entre products, orders y order_items usando helpers SECURITY DEFINER.

create or replace function public.buyer_has_product_in_orders(
  p_product_id uuid,
  p_buyer_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.order_items oi
    inner join public.orders o on o.id = oi.order_id
    where oi.product_id = p_product_id
      and o.buyer_id = p_buyer_id
  );
$$;

create or replace function public.user_is_order_buyer(
  p_order_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and o.buyer_id = p_user_id
  );
$$;

create or replace function public.seller_has_items_in_order(
  p_order_id uuid,
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
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.seller_id = p_seller_id
  );
$$;

create or replace function public.order_is_pending_for_buyer(
  p_order_id uuid,
  p_buyer_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and o.buyer_id = p_buyer_id
      and o.status = 'pending'::public.order_status
  );
$$;

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
      and p.deleted_at is null
  );
$$;

drop policy if exists "Buyers can view products in own orders" on public.products;
create policy "Buyers can view products in own orders"
on public.products for select
using (public.buyer_has_product_in_orders(id, auth.uid()));

drop policy if exists "Participants can view order items" on public.order_items;
create policy "Participants can view order items"
on public.order_items for select
using (
  seller_id = auth.uid()
  or public.user_is_order_buyer(order_id, auth.uid())
);

drop policy if exists "Sellers can view orders containing own products" on public.orders;
create policy "Sellers can view orders containing own products"
on public.orders for select
using (public.seller_has_items_in_order(id, auth.uid()));

drop policy if exists "Buyers can create items for own orders" on public.order_items;
create policy "Buyers can create items for own orders"
on public.order_items for insert
with check (
  public.order_is_pending_for_buyer(order_id, auth.uid())
  and public.is_active_product_for_seller(product_id, seller_id)
);

drop policy if exists "Sellers update orders with their products" on public.orders;
create policy "Sellers update orders with their products"
on public.orders for update
using (
  public.is_not_banned()
  and public.seller_has_items_in_order(id, auth.uid())
  and status in ('pending', 'paid', 'processing')
)
with check (public.seller_has_items_in_order(id, auth.uid()));

drop policy if exists "Authenticated users read seller payout instructions" on public.seller_payout_profiles;
drop policy if exists "Buyers read seller payout for their orders" on public.seller_payout_profiles;
create policy "Authenticated users read seller payout instructions"
on public.seller_payout_profiles for select
using (
  user_id = auth.uid()
  or public.is_super_admin()
  or auth.uid() is not null
);
