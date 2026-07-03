-- 0012 · Agrega campo emite_factura a professionals.
-- Indica si el profesional puede emitir factura electrónica al cliente.

alter table public.professionals
  add column if not exists emite_factura boolean not null default false;

grant select (emite_factura) on public.professionals to anon, authenticated;

-- Actualiza las vistas para incluir el nuevo campo.
create or replace view public.professionals_public
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, created_at,
         is_test, is_emergency, is_available_now, lat, lng, emite_factura
  from public.professionals;

create or replace view public.professionals_with_contact
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, phone, created_at,
         is_test, is_emergency, is_available_now, lat, lng, emite_factura
  from public.professionals;

-- Actualiza la función de búsqueda por proximidad (drop+create por cambio en return type).
drop function if exists public.profesionales_cerca(float8, float8, float8);
create function public.profesionales_cerca(
  _lat      float8,
  _lng      float8,
  _radio_km float8 default 15
)
returns table (
  id               uuid,
  user_id          uuid,
  name             text,
  category         text,
  location         text,
  description      text,
  is_verified      boolean,
  is_premium       boolean,
  rating           numeric,
  image_url        text,
  portfolio_urls   text[],
  created_at       timestamptz,
  is_test          boolean,
  is_emergency     boolean,
  is_available_now boolean,
  lat              float8,
  lng              float8,
  emite_factura    boolean,
  distancia_km     float8
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.user_id, p.name, p.category, p.location, p.description,
    p.is_verified, p.is_premium, p.rating,
    p.image_url, p.portfolio_urls, p.created_at,
    p.is_test, p.is_emergency, p.is_available_now,
    p.lat, p.lng,
    p.emite_factura,
    round(
      (ST_Distance(b.ubicacion, ST_Point(_lng, _lat)::geography) / 1000.0)::numeric,
      1
    )::float8 as distancia_km
  from public.professionals_public p
  join public.professionals b on b.id = p.id
  where b.ubicacion is not null
    and ST_DWithin(b.ubicacion, ST_Point(_lng, _lat)::geography, _radio_km * 1000)
  order by b.ubicacion <-> ST_Point(_lng, _lat)::geography;
$$;

grant execute on function public.profesionales_cerca(float8, float8, float8)
  to anon, authenticated;
