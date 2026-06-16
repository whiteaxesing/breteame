-- ============================================================================
-- Breteame · Migración 0003
-- Agrega is_emergency (servicio 24/7) e is_available_now (disponible ahora).
-- ============================================================================

alter table public.professionals
  add column if not exists is_emergency    boolean not null default false;

alter table public.professionals
  add column if not exists is_available_now boolean not null default false;

grant select (is_emergency, is_available_now) on public.professionals to anon;
grant select (is_emergency, is_available_now) on public.professionals to authenticated;

-- Recrear vistas con las nuevas columnas al final (evita el error de reorden).
create or replace view public.professionals_public
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, created_at,
         is_test, is_emergency, is_available_now
  from public.professionals;

create or replace view public.professionals_with_contact
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, phone, created_at,
         is_test, is_emergency, is_available_now
  from public.professionals;
