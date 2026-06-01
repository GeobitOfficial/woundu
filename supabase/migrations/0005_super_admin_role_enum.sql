-- PASO 1 de 2 — Ejecutar SOLO este archivo primero y confirmar (Run).
-- PostgreSQL exige que el nuevo valor del enum se confirme antes de usarlo.

alter type public.user_role add value if not exists 'super_admin';
