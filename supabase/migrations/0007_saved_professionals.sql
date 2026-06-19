-- ============================================================================
-- Breteame · Migración 0007
-- Profesionales guardados (favoritos) por el cliente.
-- ============================================================================

create table if not exists public.saved_professionals (
  client_id        uuid not null references auth.users(id) on delete cascade,
  professional_id  uuid not null references public.professionals(id) on delete cascade,
  created_at       timestamptz not null default now(),
  primary key (client_id, professional_id) -- evita duplicados
);

create index if not exists saved_professionals_client_idx
  on public.saved_professionals (client_id, created_at desc);

-- ============================================================================
-- Row Level Security: cada cliente maneja solo sus propios guardados.
-- ============================================================================
alter table public.saved_professionals enable row level security;

create policy "saved_select_own" on public.saved_professionals
  for select using (client_id = auth.uid());
create policy "saved_insert_own" on public.saved_professionals
  for insert with check (client_id = auth.uid());
create policy "saved_delete_own" on public.saved_professionals
  for delete using (client_id = auth.uid());

grant select, insert, delete on public.saved_professionals to authenticated;
