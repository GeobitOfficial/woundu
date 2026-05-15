-- Woundu initial marketplace schema.
-- Run this file in Supabase SQL Editor or through Supabase CLI.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('buyer', 'seller', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.product_status as enum ('draft', 'active', 'paused', 'sold', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.product_condition as enum ('new', 'like_new', 'used', 'refurbished');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum ('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique,
  avatar_url text,
  bio text,
  role public.user_role not null default 'buyer',
  reputation_score numeric(3, 2) not null default 0 check (reputation_score >= 0 and reputation_score <= 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 3 and 120),
  slug text not null unique,
  description text not null check (char_length(description) between 10 and 3000),
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  condition public.product_condition not null default 'used',
  status public.product_status not null default 'draft',
  city text,
  country text,
  is_featured boolean not null default false,
  views_count integer not null default 0 check (views_count >= 0),
  favorites_count integer not null default 0 check (favorites_count >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, reviewer_id),
  check (reviewer_id <> seller_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  total_price numeric(12, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists categories_slug_idx on public.categories (slug);
create index if not exists products_seller_id_idx on public.products (seller_id);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_status_created_at_idx on public.products (status, created_at desc);
create index if not exists products_search_idx on public.products using gin (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));
create index if not exists product_images_product_id_idx on public.product_images (product_id, sort_order);
create index if not exists favorites_product_id_idx on public.favorites (product_id);
create index if not exists reviews_seller_id_idx on public.reviews (seller_id);
create index if not exists orders_buyer_id_idx on public.orders (buyer_id, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_seller_id_idx on public.order_items (seller_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Usuario Woundu'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.categories (name, slug, description, icon, sort_order)
values
  ('Tecnologia', 'tecnologia', 'Dispositivos, accesorios y gadgets.', 'Laptop', 10),
  ('Hogar', 'hogar', 'Muebles, decoracion y articulos esenciales.', 'Home', 20),
  ('Moda', 'moda', 'Ropa, calzado y accesorios personales.', 'Shirt', 30),
  ('Servicios', 'servicios', 'Talento local, profesionales y soluciones.', 'Briefcase', 40)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Profiles are visible to everyone" on public.profiles;
create policy "Profiles are visible to everyone"
on public.profiles for select
using (deleted_at is null);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Active categories are visible to everyone" on public.categories;
create policy "Active categories are visible to everyone"
on public.categories for select
using (is_active = true);

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories for all
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Active products are visible to everyone" on public.products;
create policy "Active products are visible to everyone"
on public.products for select
using (status = 'active' and deleted_at is null);

drop policy if exists "Sellers can view own products" on public.products;
create policy "Sellers can view own products"
on public.products for select
using (seller_id = auth.uid());

drop policy if exists "Users can create own products" on public.products;
create policy "Users can create own products"
on public.products for insert
with check (seller_id = auth.uid());

drop policy if exists "Sellers can update own products" on public.products;
create policy "Sellers can update own products"
on public.products for update
using (seller_id = auth.uid())
with check (seller_id = auth.uid());

drop policy if exists "Sellers can delete own products" on public.products;
create policy "Sellers can delete own products"
on public.products for delete
using (seller_id = auth.uid());

drop policy if exists "Product images are visible for visible products" on public.product_images;
create policy "Product images are visible for visible products"
on public.product_images for select
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.deleted_at is null
      and (products.status = 'active' or products.seller_id = auth.uid())
  )
);

drop policy if exists "Sellers can manage own product images" on public.product_images;
create policy "Sellers can manage own product images"
on public.product_images for all
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.seller_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.seller_id = auth.uid()
  )
);

drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
on public.favorites for select
using (user_id = auth.uid());

drop policy if exists "Users can favorite products" on public.favorites;
create policy "Users can favorite products"
on public.favorites for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.products
    where products.id = favorites.product_id
      and products.status = 'active'
      and products.deleted_at is null
  )
);

drop policy if exists "Users can remove own favorites" on public.favorites;
create policy "Users can remove own favorites"
on public.favorites for delete
using (user_id = auth.uid());

drop policy if exists "Reviews are visible to everyone" on public.reviews;
create policy "Reviews are visible to everyone"
on public.reviews for select
using (true);

drop policy if exists "Authenticated users can create reviews" on public.reviews;
create policy "Authenticated users can create reviews"
on public.reviews for insert
with check (
  reviewer_id = auth.uid()
  and reviewer_id <> seller_id
  and exists (
    select 1 from public.products
    where products.id = reviews.product_id
      and products.seller_id = reviews.seller_id
      and products.status in ('active', 'sold')
  )
);

drop policy if exists "Reviewers can update own reviews" on public.reviews;
create policy "Reviewers can update own reviews"
on public.reviews for update
using (reviewer_id = auth.uid())
with check (reviewer_id = auth.uid());

drop policy if exists "Buyers can view own orders" on public.orders;
create policy "Buyers can view own orders"
on public.orders for select
using (buyer_id = auth.uid());

drop policy if exists "Sellers can view orders containing own products" on public.orders;
create policy "Sellers can view orders containing own products"
on public.orders for select
using (
  exists (
    select 1 from public.order_items
    where order_items.order_id = orders.id
      and order_items.seller_id = auth.uid()
  )
);

drop policy if exists "Buyers can create own orders" on public.orders;
create policy "Buyers can create own orders"
on public.orders for insert
with check (buyer_id = auth.uid());

drop policy if exists "Buyers can update pending own orders" on public.orders;
create policy "Buyers can update pending own orders"
on public.orders for update
using (buyer_id = auth.uid() and status = 'pending')
with check (buyer_id = auth.uid());

drop policy if exists "Participants can view order items" on public.order_items;
create policy "Participants can view order items"
on public.order_items for select
using (
  seller_id = auth.uid()
  or exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.buyer_id = auth.uid()
  )
);

drop policy if exists "Buyers can create items for own orders" on public.order_items;
create policy "Buyers can create items for own orders"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.buyer_id = auth.uid()
      and orders.status = 'pending'
  )
  and exists (
    select 1 from public.products
    where products.id = order_items.product_id
      and products.seller_id = order_items.seller_id
      and products.status = 'active'
      and products.deleted_at is null
  )
);
