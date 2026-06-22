-- ============================================================================
-- 0010 · Cierra un hueco de seguridad: profiles_update_own (RLS) permitía que
-- cualquier usuario logueado cambiara su propio role a 'admin' o 'profesional'
-- directamente desde el cliente (no había guard, a diferencia de is_verified
-- en professionals). Se restringe a nivel de columna: authenticated solo puede
-- actualizar full_name de su propio perfil. Cambiar role sigue requiriendo el
-- cliente admin (service_role), como ya hacían invitarProfesional /
-- darAccesoProfesional / registrarProfesionalConCuenta.
-- ============================================================================

revoke update on public.profiles from authenticated, anon;
grant update (full_name) on public.profiles to authenticated;
