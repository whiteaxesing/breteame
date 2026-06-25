-- ============================================================================
-- 0012 · Limpieza de datos ficticios antes de la carga real de profesionales.
--
-- Borra los profesionales de PRUEBA (is_test = true) y todo su rastro —leads,
-- reseñas, guardados y vistas se van en cascada—, vacía los leads/reseñas/
-- guardados restantes (a esta fecha todos son demo) y elimina las cuentas demo.
--
-- PRESERVA:
--   · Usuarios reales (incl. oficialgadea@gmail.com).
--   · Profesionales reales auto-registrados desde /unirse (is_test = false).
--
-- Correr en el SQL Editor de Supabase: toca auth.users, que requiere un rol
-- con privilegios (no se puede via DATABASE_URL/REST).
--
-- Idempotente y seguro en setups nuevos: si no hay datos demo, no borra nada.
-- ============================================================================

begin;

-- 1. Profesionales de prueba → cascada: contacts, reviews, saved_professionals
--    y profile_views asociados a esos pros se eliminan solos.
delete from public.professionals where is_test = true;

-- 2. Resto de leads / reseñas / guardados ficticios (a esta fecha, todos lo son).
--    Si ya tenés datos reales que querés conservar, comentá estas tres líneas.
delete from public.contacts;
delete from public.reviews;
delete from public.saved_professionals;

-- 3. Cuentas demo + placeholders de acceso de profesionales.
--    Cascada: borra su profile y datos; en professionals.user_id queda null.
delete from auth.users
where email in ('cliente@demo.cr', 'pro@demo.cr', 'admin@demo.cr')
   or email like 'pro-%@breteame.internal';

commit;

-- ----------------------------------------------------------------------------
-- OPCIONAL · canal QR de prueba (ferreterías seed + escaneos). Las ZONAS de
-- calle son tu infraestructura de campaña: borralas solo si vas a regenerarlas
-- con scripts/seed-zonas.mjs. Descomentá si querés arrancar el QR desde cero:
-- ----------------------------------------------------------------------------
-- delete from public.qr_events;
-- delete from public.stores;
