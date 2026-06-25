-- ============================================================================
-- 0013 · Fotos de profesionales con moderación.
--
-- Bucket de Storage + tabla `professional_photos` como cola de moderación
-- (pendiente / aprobada / rechazada). Las fotos APROBADAS se copian a
-- professionals.image_url (perfil) o .portfolio_urls (portafolio), que es lo
-- que el público ya muestra — así no hay que tocar las vistas existentes.
--
-- El bucket es público en LECTURA para que la API de moderación (OpenAI) pueda
-- leer la URL al revisar. Las fotos rechazadas se borran del Storage por el
-- server action, así no queda contenido inapropiado colgando.
--
-- Correr en el SQL Editor de Supabase (crea bucket + políticas de storage).
-- ============================================================================

-- ---- Bucket -----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fotos-profesionales', 'fotos-profesionales', true)
on conflict (id) do nothing;

-- Cada profesional sube a su carpeta {auth.uid()}/archivo.
create policy "fotos_insert_propias" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos-profesionales'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "fotos_update_propias" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'fotos-profesionales'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "fotos_delete_propias" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'fotos-profesionales'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "fotos_select_publicas" on storage.objects
  for select using (bucket_id = 'fotos-profesionales');

-- ---- Tabla de moderación ----------------------------------------------------
create table if not exists public.professional_photos (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  url             text not null,
  storage_path    text not null,
  tipo            text not null check (tipo in ('perfil', 'portafolio')),
  estado          text not null default 'pendiente'
                    check (estado in ('pendiente', 'aprobada', 'rechazada')),
  motivo          text,           -- razón de la IA / admin
  created_at      timestamptz not null default now()
);

create index if not exists professional_photos_prof_idx   on public.professional_photos (professional_id);
create index if not exists professional_photos_estado_idx on public.professional_photos (estado);

alter table public.professional_photos enable row level security;

-- El dueño ve sus propias fotos (incluye pendientes/rechazadas, para el estado).
create policy "photos_select_propias" on public.professional_photos
  for select using (
    professional_id in (select id from public.professionals where user_id = auth.uid())
  );

-- El público solo ve las aprobadas.
create policy "photos_select_aprobadas" on public.professional_photos
  for select using (estado = 'aprobada');

-- Admin: control total (guard auth.uid() para no llamar current_user_role como anon).
create policy "photos_admin_all" on public.professional_photos
  for all
  using      (auth.uid() is not null and public.current_user_role() = 'admin')
  with check (auth.uid() is not null and public.current_user_role() = 'admin');

-- Las escrituras (insert/update/delete) van por server actions con service role,
-- que salta RLS; por eso authenticated solo necesita SELECT.
grant select on public.professional_photos to anon, authenticated;
