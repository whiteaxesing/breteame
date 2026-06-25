-- ============================================================================
-- 0011 · Cierra advertencias del Security Advisor de Supabase.
--
-- 1. spatial_ref_sys: habilita RLS (tabla PostGIS expuesta sin protección).
--    Sin políticas propias → nadie la lee via REST; PostGIS la accede
--    internamente con SECURITY DEFINER, lo que bypasea RLS.
--
-- 2. Funciones trigger: revoca EXECUTE de anon/authenticated.
--    Los triggers los invoca el motor de BD, no el rol del cliente; el
--    EXECUTE del llamante no aplica para invocaciones via trigger
--    (PostgreSQL docs: "The user who issues a DML statement that fires a
--    trigger does not need any special privileges to execute the trigger
--    function."). Quedan llamables internamente pero ya no via REST RPC.
--
-- 3. current_user_role(): antes de revocar de anon, se añade el guard
--    `auth.uid() is not null` en cada política que la invoca. PostgreSQL
--    evalúa AND con cortocircuito, así que cuando el rol es anon
--    (auth.uid() = null) nunca llega a llamar current_user_role().
--    Esto permite revocar de anon sin romper la evaluación de RLS.
--    NO se revoca de authenticated: los usuarios logueados la necesitan
--    para que las políticas admin funcionen.
-- ============================================================================

-- NOTA: spatial_ref_sys pertenece al owner de PostGIS (no es nuestra tabla).
-- Para habilitarle RLS hay que ir al SQL Editor de Supabase como superuser:
--   ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
-- No se puede correr desde el rol postgres via DATABASE_URL.

-- 2. Trigger functions: sin acceso directo via REST
revoke execute on function public.guard_professional_verification() from anon, authenticated;
revoke execute on function public.handle_new_user()                  from anon, authenticated;
revoke execute on function public.recalcular_rating_profesional()    from anon, authenticated;
revoke execute on function public.sync_ubicacion()                   from anon, authenticated;

-- 3a. Políticas admin: añade auth.uid() is not null como cortocircuito
--     para que anon nunca evalúe current_user_role().

-- profiles
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (auth.uid() is not null and public.current_user_role() = 'admin');

-- professionals
drop policy if exists "professionals_admin_all" on public.professionals;
create policy "professionals_admin_all" on public.professionals
  for all
  using     (auth.uid() is not null and public.current_user_role() = 'admin')
  with check(auth.uid() is not null and public.current_user_role() = 'admin');

-- contacts
drop policy if exists "contacts_admin_all" on public.contacts;
create policy "contacts_admin_all" on public.contacts
  for all
  using     (auth.uid() is not null and public.current_user_role() = 'admin')
  with check(auth.uid() is not null and public.current_user_role() = 'admin');

-- stores
drop policy if exists "stores_admin_all" on public.stores;
create policy "stores_admin_all" on public.stores
  for all
  using     (auth.uid() is not null and public.current_user_role() = 'admin')
  with check(auth.uid() is not null and public.current_user_role() = 'admin');

-- 3b. Ahora es seguro revocar de anon: ya no llegará a evaluarla en RLS
revoke execute on function public.current_user_role() from anon;
