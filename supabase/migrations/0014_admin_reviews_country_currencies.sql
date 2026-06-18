-- Permisos Super Admin: gestión de monedas por país y moderación de reseñas.

drop policy if exists "Super admins manage country currencies" on public.marketplace_country_currencies;
create policy "Super admins manage country currencies"
on public.marketplace_country_currencies for all
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Super admins manage reviews" on public.reviews;
create policy "Super admins manage reviews"
on public.reviews for all
using (public.is_super_admin())
with check (public.is_super_admin());
