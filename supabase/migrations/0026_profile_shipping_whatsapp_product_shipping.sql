-- Datos de envío del comprador, WhatsApp del vendedor y tipo de envío del producto.

create type public.product_shipping_type as enum ('free', 'paid');

alter table public.profiles
  add column if not exists shipping_city text,
  add column if not exists shipping_address text,
  add column if not exists phone text,
  add column if not exists whatsapp text;

alter table public.products
  add column if not exists shipping_type public.product_shipping_type not null default 'free';

comment on column public.profiles.shipping_city is 'Ciudad de entrega del comprador.';
comment on column public.profiles.shipping_address is 'Dirección de entrega del comprador.';
comment on column public.profiles.phone is 'Teléfono de contacto del comprador.';
comment on column public.profiles.whatsapp is 'WhatsApp del vendedor (solo dígitos, con código de país).';
comment on column public.products.shipping_type is 'Envío gratis o pagado (negociado con el comprador).';
