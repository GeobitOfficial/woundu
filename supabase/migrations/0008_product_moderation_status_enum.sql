-- PASO 1 — Ejecutar solo esta query primero (commit separado).

alter type public.product_status add value if not exists 'pending_review';
alter type public.product_status add value if not exists 'rejected';
