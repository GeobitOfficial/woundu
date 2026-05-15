-- Filtros por país en el catálogo activo
create index if not exists products_country_active_idx
  on public.products (country)
  where deleted_at is null and status = 'active';
