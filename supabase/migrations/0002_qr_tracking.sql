-- ============================================================================
-- 0002_qr_tracking.sql
-- Tracking de escaneos QR por ferretería + atribución en contactos.
-- ============================================================================

-- Slug legible para URLs: /f/ferreteria-el-mar
alter table public.stores
  add column if not exists slug text unique;

-- Slugs para los stores del seed
update public.stores set slug = 'ferreteria-el-mar'      where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
update public.stores set slug = 'deposito-los-angeles'   where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
update public.stores set slug = 'epa-san-sebastian'      where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
update public.stores set slug = 'ferreteria-central'     where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

-- Tabla de eventos individuales (para atribución real, no solo el contador)
create table if not exists public.qr_events (
  id          uuid primary key default gen_random_uuid(),
  store_slug  text not null,
  user_agent  text,
  ip          text,
  created_at  timestamptz not null default now()
);

alter table public.qr_events enable row level security;

-- Solo el admin puede leer; el insert lo hace el service role desde el Route Handler
create policy "qr_events_admin_select" on public.qr_events
  for select using (public.current_user_role() = 'admin');

-- Atribución: de qué ferretería llegó el cliente que hizo el contacto
alter table public.contacts
  add column if not exists qr_source text;
