-- ============================================================================
-- Breteame · Migración inicial (0001_init.sql)
-- Tablas: profiles, professionals, contacts, stores
-- + vistas para proteger el teléfono, función de rol, trigger de perfil y RLS.
-- Correr en el SQL Editor de Supabase (o `supabase db reset` en local).
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- profiles: extiende auth.users con el rol de la app
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'cliente'
             check (role in ('cliente','profesional','admin')),
  full_name  text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- professionals
--   portfolio_urls: ADICIÓN al modelo inicial para soportar el portafolio del
--   perfil; si está vacío, la UI oculta la sección (sin huecos rotos).
-- ----------------------------------------------------------------------------
create table if not exists public.professionals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null, -- null si es seed/pre-curado
  name          text not null,
  category      text not null
                check (category in ('fontaneria','electricidad','cerrajeria','jardineria','escombreros')),
  location      text not null,
  description   text,
  is_verified   boolean not null default false,
  is_premium    boolean not null default false,
  rating        numeric(2,1) not null default 0,
  image_url     text,
  portfolio_urls text[] not null default '{}',
  phone         text,
  created_at    timestamptz not null default now()
);

create index if not exists professionals_category_idx on public.professionals (category);
create index if not exists professionals_user_id_idx  on public.professionals (user_id);

-- ----------------------------------------------------------------------------
-- contacts (leads)
--   client_name: ADICIÓN. Se captura el nombre del cliente al contactar, para
--   que el panel del profesional no necesite leer el profile de otro usuario
--   (lo que chocaría con RLS).
-- ----------------------------------------------------------------------------
create table if not exists public.contacts (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  client_id       uuid not null references auth.users(id) on delete cascade,
  client_name     text,
  channel         text not null check (channel in ('whatsapp','llamada','copiar')),
  status          text not null default 'nuevo' check (status in ('nuevo','contactado','cerrado')),
  created_at      timestamptz not null default now()
);

create index if not exists contacts_professional_id_idx on public.contacts (professional_id);
create index if not exists contacts_client_id_idx       on public.contacts (client_id);

-- ----------------------------------------------------------------------------
-- stores (ferreterías, para el storytelling del pitch)
-- ----------------------------------------------------------------------------
create table if not exists public.stores (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  is_partner boolean not null default false,
  qr_scans   int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Helper: rol del usuario actual.
-- security definer para poder leer profiles sin disparar su propia RLS
-- (evita recursión en las políticas que dependen del rol).
-- ============================================================================
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================================
-- Trigger: crear el profile automáticamente al registrarse un usuario.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Guard: solo un admin puede cambiar is_verified.
-- Aunque el dueño pueda editar su perfil (RLS), no puede auto-verificarse.
-- ============================================================================
create or replace function public.guard_professional_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_verified is distinct from old.is_verified
     and public.current_user_role() is distinct from 'admin' then
    new.is_verified := old.is_verified; -- ignora el cambio si no es admin
  end if;
  return new;
end;
$$;

drop trigger if exists professionals_guard_verification on public.professionals;
create trigger professionals_guard_verification
  before update on public.professionals
  for each row execute function public.guard_professional_verification();

-- ============================================================================
-- Vistas para proteger el teléfono (spec: una pública y una autenticada).
-- security_invoker = on  → la RLS de la tabla base sigue aplicando.
-- ============================================================================
create or replace view public.professionals_public
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, created_at
  from public.professionals;

create or replace view public.professionals_with_contact
with (security_invoker = on) as
  select id, user_id, name, category, location, description,
         is_verified, is_premium, rating, image_url, portfolio_urls, phone, created_at
  from public.professionals;

-- ============================================================================
-- Privilegios a nivel columna: el teléfono NO se expone a usuarios anónimos,
-- ni siquiera consultando la tabla base directo por la API REST.
-- ============================================================================
revoke select on public.professionals from anon, authenticated;

grant select (id, user_id, name, category, location, description,
              is_verified, is_premium, rating, image_url, portfolio_urls, created_at)
  on public.professionals to anon;

grant select (id, user_id, name, category, location, description,
              is_verified, is_premium, rating, image_url, portfolio_urls, phone, created_at)
  on public.professionals to authenticated;

-- La vista con teléfono solo para autenticados.
revoke select on public.professionals_with_contact from anon;
grant  select on public.professionals_with_contact to authenticated;
grant  select on public.professionals_public        to anon, authenticated;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.professionals enable row level security;
alter table public.contacts      enable row level security;
alter table public.stores        enable row level security;

-- ---- profiles --------------------------------------------------------------
create policy "profiles_select_own"   on public.profiles
  for select using (id = auth.uid());
create policy "profiles_select_admin" on public.profiles
  for select using (public.current_user_role() = 'admin');
create policy "profiles_update_own"   on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---- professionals ---------------------------------------------------------
create policy "professionals_select_public" on public.professionals
  for select using (true);
create policy "professionals_insert_own"    on public.professionals
  for insert with check (user_id = auth.uid());
create policy "professionals_update_own"    on public.professionals
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "professionals_admin_all"     on public.professionals
  for all using (public.current_user_role() = 'admin')
          with check (public.current_user_role() = 'admin');

-- ---- contacts --------------------------------------------------------------
create policy "contacts_insert_client"   on public.contacts
  for insert with check (client_id = auth.uid());
create policy "contacts_select_client"   on public.contacts
  for select using (client_id = auth.uid());
create policy "contacts_select_pro"      on public.contacts
  for select using (
    professional_id in (select id from public.professionals where user_id = auth.uid())
  );
create policy "contacts_update_pro"      on public.contacts
  for update using (
    professional_id in (select id from public.professionals where user_id = auth.uid())
  ) with check (
    professional_id in (select id from public.professionals where user_id = auth.uid())
  );
create policy "contacts_admin_all"       on public.contacts
  for all using (public.current_user_role() = 'admin')
          with check (public.current_user_role() = 'admin');

-- ---- stores (solo admin) ---------------------------------------------------
create policy "stores_admin_all" on public.stores
  for all using (public.current_user_role() = 'admin')
          with check (public.current_user_role() = 'admin');
