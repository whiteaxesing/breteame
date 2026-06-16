-- ============================================================================
-- Breteame · Migración 0002
-- Agrega is_test a professionals para segregar datos demo de profesionales reales.
-- ============================================================================

alter table public.professionals
  add column if not exists is_test boolean not null default false;

-- Todos los registros actuales son de prueba.
update public.professionals set is_test = true;

-- Columna accesible para anon y authenticated (via columna-grant).
grant select (is_test) on public.professionals to anon;
grant select (is_test) on public.professionals to authenticated;

-- Recrear vistas con is_test incluido (las vistas usan columnas explícitas).
create or replace view public.professionals_public
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, created_at, is_test
  from public.professionals;

create or replace view public.professionals_with_contact
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, phone, created_at, is_test
  from public.professionals;
