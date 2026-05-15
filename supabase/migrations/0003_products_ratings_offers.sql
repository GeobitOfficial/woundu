-- Calificación agregada del producto, conteo de reseñas y ofertas (precio de referencia).

alter table public.products
  add column if not exists rating_average numeric(3, 2) not null default 0
    check (rating_average >= 0 and rating_average <= 5),
  add column if not exists reviews_count integer not null default 0
    check (reviews_count >= 0),
  add column if not exists compare_at_price numeric(12, 2)
    check (compare_at_price is null or compare_at_price >= 0),
  add column if not exists is_on_offer boolean not null default false;

-- Oferta: precio de referencia estrictamente mayor al precio actual.
create or replace function public.set_product_offer_flag()
returns trigger
language plpgsql
as $$
begin
  new.is_on_offer :=
    new.compare_at_price is not null
    and new.compare_at_price > new.price;
  return new;
end;
$$;

drop trigger if exists trg_products_set_offer on public.products;
create trigger trg_products_set_offer
before insert or update of price, compare_at_price on public.products
for each row
execute function public.set_product_offer_flag();

-- Sincroniza promedio y conteo desde reseñas del producto.
create or replace function public.sync_product_rating_from_reviews()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  target := coalesce(new.product_id, old.product_id);

  update public.products p
  set
    reviews_count = (
      select count(*)::integer from public.reviews r where r.product_id = target
    ),
    rating_average = coalesce(
      (
        select avg(r.rating::numeric)::numeric(3, 2)
        from public.reviews r
        where r.product_id = target
      ),
      0
    )
  where p.id = target;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_sync_product_rating on public.reviews;
create trigger trg_reviews_sync_product_rating
after insert or update or delete on public.reviews
for each row
execute function public.sync_product_rating_from_reviews();

-- Datos existentes
update public.products as p
set
  reviews_count = coalesce(stats.cnt, 0),
  rating_average = coalesce(stats.avg_num, 0)
from (
  select
    product_id,
    count(*)::integer as cnt,
    avg(rating::numeric)::numeric(3, 2) as avg_num
  from public.reviews
  group by product_id
) as stats
where p.id = stats.product_id;

update public.products
set is_on_offer = compare_at_price is not null and compare_at_price > price;

create index if not exists products_active_offer_idx
  on public.products (is_on_offer)
  where deleted_at is null and status = 'active';

create index if not exists products_active_price_idx
  on public.products (price)
  where deleted_at is null and status = 'active';

create index if not exists products_active_rating_idx
  on public.products (rating_average)
  where deleted_at is null and status = 'active';
