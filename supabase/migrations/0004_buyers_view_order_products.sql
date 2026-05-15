-- Permite que un comprador vea datos de productos vinculados a sus pedidos
-- (p. ej. título en historial aunque el producto ya no esté `active`).
drop policy if exists "Buyers can view products in own orders" on public.products;
create policy "Buyers can view products in own orders"
on public.products for select
using (
  exists (
    select 1
    from public.order_items oi
    inner join public.orders o on o.id = oi.order_id
    where oi.product_id = products.id
      and o.buyer_id = auth.uid()
  )
);
