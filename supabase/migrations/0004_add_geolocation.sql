-- ============================================================================
-- Breteame · Migración 0004
-- Geolocalización: columnas lat/lng + geography indexada + trigger de sincronía
-- + función RPC profesionales_cerca() para búsqueda por proximidad.
-- ============================================================================

create extension if not exists postgis;

-- lat/lng para manipular vía REST API; ubicacion para consultas PostGIS.
alter table public.professionals
  add column if not exists lat  float8,
  add column if not exists lng  float8,
  add column if not exists ubicacion geography(Point, 4326);

-- Índice GiST: hace ST_DWithin y <-> muy rápidos aunque haya miles de filas.
create index if not exists professionals_ubicacion_idx
  on public.professionals using gist(ubicacion);

-- Grants para las columnas nuevas visibles al cliente.
grant select (lat, lng) on public.professionals to anon;
grant select (lat, lng) on public.professionals to authenticated;

-- Trigger: mantiene ubicacion sincronizada cada vez que lat o lng cambian.
create or replace function public.sync_ubicacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lat is not null and new.lng is not null then
    new.ubicacion := ST_Point(new.lng, new.lat)::geography;
  else
    new.ubicacion := null;
  end if;
  return new;
end;
$$;

drop trigger if exists professionals_sync_ubicacion on public.professionals;
create trigger professionals_sync_ubicacion
  before insert or update on public.professionals
  for each row execute function public.sync_ubicacion();

-- Recrear vistas con lat/lng al final (evita error de reorden de columnas).
create or replace view public.professionals_public
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, created_at,
         is_test, is_emergency, is_available_now, lat, lng
  from public.professionals;

create or replace view public.professionals_with_contact
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, phone, created_at,
         is_test, is_emergency, is_available_now, lat, lng
  from public.professionals;

-- ============================================================================
-- RPC: profesionales_cerca(_lat, _lng, _radio_km)
-- Devuelve profesionales ordenados por distancia dentro del radio.
-- PostgREST permite encadenar .eq(), .ilike(), etc. sobre el resultado.
-- security definer: accede a ubicacion (geography) que no está en los grants
-- de columna, pero solo devuelve las columnas de professionals_public + distancia.
-- ============================================================================
create or replace function public.profesionales_cerca(
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
