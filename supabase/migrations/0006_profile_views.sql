-- ============================================================================
-- Breteame · Migración 0006
-- Tracking de vistas del anuncio (perfil público) para las métricas del pro.
-- Mismo enfoque que qr_events: una fila por evento → permite total y "este mes".
-- ============================================================================

create table if not exists public.profile_views (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references public.professionals(id) on delete cascade,
  viewer_id        uuid references auth.users(id) on delete set null, -- null si es anónimo
  created_at       timestamptz not null default now()
);

create index if not exists profile_views_professional_idx
  on public.profile_views (professional_id, created_at);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profile_views enable row level security;

-- Cualquier visitante (anónimo o logueado) puede registrar una vista.
create policy "profile_views_insert_any" on public.profile_views
  for insert with check (true);

-- El profesional solo ve las vistas de su propio anuncio.
create policy "profile_views_select_pro" on public.profile_views
  for select using (
    professional_id in (select id from public.professionals where user_id = auth.uid())
  );

-- El admin ve todo (para métricas globales del pitch).
create policy "profile_views_admin_all" on public.profile_views
  for all using (public.current_user_role() = 'admin')
          with check (public.current_user_role() = 'admin');

-- ============================================================================
-- Grants
-- ============================================================================
grant insert on public.profile_views to anon, authenticated;
grant select on public.profile_views to authenticated;
