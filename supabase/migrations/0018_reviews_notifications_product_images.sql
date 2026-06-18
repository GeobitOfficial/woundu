-- Reseñas solo tras compra completada, notificaciones in-app y bucket de imágenes de producto.

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (char_length(type) between 1 and 64),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 500),
  href text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_notifications_user_created_idx
  on public.user_notifications (user_id, created_at desc);

create index if not exists user_notifications_user_unread_idx
  on public.user_notifications (user_id, created_at desc)
  where read_at is null;

alter table public.user_notifications enable row level security;

drop policy if exists "Users read own notifications" on public.user_notifications;
create policy "Users read own notifications"
on public.user_notifications for select
using (user_id = auth.uid());

drop policy if exists "Users update own notifications" on public.user_notifications;
create policy "Users update own notifications"
on public.user_notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.notify_seller_on_new_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer_name text;
  product_title text;
begin
  select p.full_name
  into buyer_name
  from public.orders o
  join public.profiles p on p.id = o.buyer_id
  where o.id = new.order_id;

  select pr.title
  into product_title
  from public.products pr
  where pr.id = new.product_id;

  insert into public.user_notifications (
    user_id,
    type,
    title,
    body,
    href,
    metadata
  )
  values (
    new.seller_id,
    'new_order',
    'Nuevo pedido',
    format(
      '%s pidió %s. Revisa el pedido y coordina el pago directo.',
      coalesce(buyer_name, 'Un comprador'),
      coalesce(product_title, 'tu producto')
    ),
    '/cuenta/pedidos/' || new.order_id::text,
    jsonb_build_object(
      'order_id', new.order_id,
      'product_id', new.product_id
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_seller_new_order on public.order_items;
create trigger trg_notify_seller_new_order
after insert on public.order_items
for each row
execute function public.notify_seller_on_new_order_item();

drop policy if exists "Authenticated users can create reviews" on public.reviews;
drop policy if exists "Buyers can review purchased products" on public.reviews;
create policy "Buyers can review purchased products"
on public.reviews for insert
with check (
  reviewer_id = auth.uid()
  and reviewer_id <> seller_id
  and exists (
    select 1
    from public.products
    where products.id = reviews.product_id
      and products.seller_id = reviews.seller_id
      and products.status in ('active', 'sold')
  )
  and exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_id = reviews.product_id
      and o.buyer_id = auth.uid()
      and o.status = 'completed'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Product images are publicly accessible" on storage.objects;
create policy "Product images are publicly accessible"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Sellers upload own product images" on storage.objects;
create policy "Sellers upload own product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and exists (
    select 1
    from public.products
    where products.id = (storage.foldername(name))[2]::uuid
      and products.seller_id = auth.uid()
  )
);

drop policy if exists "Sellers update own product images" on storage.objects;
create policy "Sellers update own product images"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and exists (
    select 1
    from public.products
    where products.id = (storage.foldername(name))[2]::uuid
      and products.seller_id = auth.uid()
  )
)
with check (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and exists (
    select 1
    from public.products
    where products.id = (storage.foldername(name))[2]::uuid
      and products.seller_id = auth.uid()
  )
);

drop policy if exists "Sellers delete own product images" on storage.objects;
create policy "Sellers delete own product images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and exists (
    select 1
    from public.products
    where products.id = (storage.foldername(name))[2]::uuid
      and products.seller_id = auth.uid()
  )
);
