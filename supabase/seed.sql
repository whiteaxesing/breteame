-- ============================================================================
-- Breteame · Datos de prueba (seed.sql)
-- Correr DESPUÉS de 0001_init.sql. Es idempotente (on conflict do nothing).
-- Estos datos son ficticios: borralos antes de producción.
--   · 1 profesional por categoría
--   · mezcla de is_verified / is_premium
--   · 2 SIN image_url (para verificar el placeholder)
--   · algunos con portfolio_urls y otros vacíos (para verificar que se oculta)
-- Las imágenes usan picsum.photos (siempre cargan) solo para el demo.
-- ============================================================================

insert into public.professionals
  (id, name, category, location, description, is_verified, is_premium, rating, image_url, portfolio_urls, phone)
values
  -- 1) Fontanería — verificado + premium, CON foto y portafolio.
  --    A este lo enlaza scripts/seed-users.mjs con la cuenta pro@demo.cr.
  ('11111111-1111-4111-8111-111111111111',
   'Marvin Jiménez',
   'fontaneria',
   'San José, Hatillo',
   'Fontanero con 12 años de experiencia. Fugas, destaqueos, instalación de calentadores y tanques. Atención el mismo día.',
   true, true, 4.9,
   'https://picsum.photos/seed/breteame-marvin/400/400',
   array[
     'https://picsum.photos/seed/breteame-marvin-1/600/400',
     'https://picsum.photos/seed/breteame-marvin-2/600/400',
     'https://picsum.photos/seed/breteame-marvin-3/600/400'
   ],
   '+50688881111'),

  -- 2) Electricidad — verificado, SIN premium, SIN foto (placeholder), sin portafolio.
  ('22222222-2222-4222-8222-222222222222',
   'Carlos Mora',
   'electricidad',
   'Heredia, Centro',
   'Electricista residencial. Cortocircuitos, breakers, tomas, iluminación LED y revisión de paneles.',
   true, false, 4.5,
   null,
   '{}',
   '+50688882222'),

  -- 3) Cerrajería — verificado + premium, CON foto y portafolio.
  ('33333333-3333-4333-8333-333333333333',
   'Cerrajería Llave Maestra 24/7',
   'cerrajeria',
   'Alajuela, Centro',
   'Apertura de puertas y vehículos, cambio de cilindros, copias de llaves y cerraduras de seguridad. Servicio 24/7.',
   true, true, 4.8,
   'https://picsum.photos/seed/breteame-llave/400/400',
   array[
     'https://picsum.photos/seed/breteame-llave-1/600/400',
     'https://picsum.photos/seed/breteame-llave-2/600/400'
   ],
   '+50688883333'),

  -- 4) Jardinería — SIN verificar (aparece para que el admin lo verifique en el demo),
  --    SIN foto (placeholder), sin portafolio.
  ('44444444-4444-4444-8444-444444444444',
   'Jardines Pura Vida',
   'jardineria',
   'Cartago, La Unión',
   'Mantenimiento de jardines, poda de árboles, zacate y diseño de zonas verdes para casas y condominios.',
   false, false, 4.2,
   null,
   '{}',
   '+50688884444'),

  -- 5) Escombreros / remoción — verificado, SIN premium, CON foto, sin portafolio.
  ('55555555-5555-4555-8555-555555555555',
   'Acarreos y Demoliciones GAM',
   'escombreros',
   'San José, Desamparados',
   'Remoción de escombros, demolición menor y acarreo de materiales. Vagoneta propia, cotización rápida.',
   true, false, 4.6,
   'https://picsum.photos/seed/breteame-gam/400/400',
   '{}',
   '+50688885555')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Ferreterías (para el contador de QR del pitch)
-- ----------------------------------------------------------------------------
insert into public.stores (id, name, address, is_partner, qr_scans)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Ferretería El Mar',        'Hatillo, San José',      true,  142),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Depósito Los Ángeles',     'Heredia Centro',         true,   87),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'EPA San Sebastián',        'San Sebastián, San José',true,  230),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Ferretería Central',       'Alajuela Centro',        false,   0)
on conflict (id) do nothing;

-- ============================================================================
-- PLANTILLA — agregá tus profesionales REALES acá.
-- Copiá el bloque, completá los valores y descomentalo.
--   · category debe ser uno de:
--       fontaneria | electricidad | cerrajeria | jardineria | escombreros
--   · image_url null      → la UI muestra un placeholder con la inicial.
--   · portfolio_urls '{}' → la UI oculta la sección de portafolio.
--   · rating va de 0 a 5.
-- ============================================================================
-- insert into public.professionals
--   (name, category, location, description, phone, is_verified, is_premium, rating, image_url, portfolio_urls)
-- values
--   ('Nombre Apellido',
--    'fontaneria',
--    'Cantón, zona',
--    'Descripción corta del servicio que ofrece.',
--    '+50688880000',
--    true,    -- is_verified (lo decide el admin)
--    false,   -- is_premium
--    0,       -- rating (0 a 5)
--    null,    -- image_url
--    '{}'     -- portfolio_urls, p.ej. array['https://.../1.jpg','https://.../2.jpg']
--   );
