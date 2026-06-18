-- Bucket público de imágenes de producto + políticas de storage.

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

create or replace function public.seller_owns_product(p_product_id uuid, p_seller_id uuid)
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
      and p.deleted_at is null
  );
$$;

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
  and public.seller_owns_product(
    (storage.foldername(name))[2]::uuid,
    auth.uid()
  )
);

drop policy if exists "Sellers update own product images" on storage.objects;
create policy "Sellers update own product images"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and public.seller_owns_product(
    (storage.foldername(name))[2]::uuid,
    auth.uid()
  )
)
with check (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and public.seller_owns_product(
    (storage.foldername(name))[2]::uuid,
    auth.uid()
  )
);

drop policy if exists "Sellers delete own product images" on storage.objects;
create policy "Sellers delete own product images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and public.seller_owns_product(
    (storage.foldername(name))[2]::uuid,
    auth.uid()
  )
);
