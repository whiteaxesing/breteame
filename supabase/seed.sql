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
  (id, name, category, location, description, is_verified, is_premium, is_test, rating, image_url, portfolio_urls, phone)
values
  -- 1) Fontanería — verificado + premium, CON foto y portafolio.
  --    A este lo enlaza scripts/seed-users.mjs con la cuenta pro@demo.cr.
  ('11111111-1111-4111-8111-111111111111',
   'Marvin Jiménez',
   'fontaneria',
   'San José, Hatillo',
   'Fontanero con 12 años de experiencia. Fugas, destaqueos, instalación de calentadores y tanques. Atención el mismo día.',
   true, true, true, 4.9,
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
   true, false, true, 4.5,
   null,
   '{}',
   '+50688882222'),

  -- 3) Cerrajería — verificado + premium, CON foto y portafolio.
  ('33333333-3333-4333-8333-333333333333',
   'Cerrajería Llave Maestra 24/7',
   'cerrajeria',
   'Alajuela, Centro',
   'Apertura de puertas y vehículos, cambio de cilindros, copias de llaves y cerraduras de seguridad. Servicio 24/7.',
   true, true, true, 4.8,
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
   false, false, true, 4.2,
   null,
   '{}',
   '+50688884444'),

  -- 5) Escombreros / remoción — verificado, SIN premium, CON foto, sin portafolio.
  ('55555555-5555-4555-8555-555555555555',
   'Acarreos y Demoliciones GAM',
   'escombreros',
   'San José, Desamparados',
   'Remoción de escombros, demolición menor y acarreo de materiales. Vagoneta propia, cotización rápida.',
   true, false, true, 4.6,
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

-- ----------------------------------------------------------------------------
-- Más profesionales de prueba (para que el demo se vea poblado)
-- ----------------------------------------------------------------------------
insert into public.professionals
  (id, name, category, location, description, is_verified, is_premium, is_test, rating, image_url, portfolio_urls, phone)
values
  -- Fontanería adicional
  ('66666666-6666-4666-8666-666666666666',
   'Andrea Solís Fontanería',
   'fontaneria',
   'Heredia, San Pablo',
   'Especialista en fontanería residencial y comercial. Reparación de tuberías, instalación de llaves y calentadores solares.',
   true, false, true, 4.3,
   'https://picsum.photos/seed/breteame-andrea/400/400',
   '{}',
   '+50688886666'),

  ('77777777-7777-4777-8777-777777777777',
   'Fontanería y Gas CR',
   'fontaneria',
   'Escazú, San Rafael',
   'Instalación y mantenimiento de gas LP, gas natural y tubería de agua. Certificados por ARESEP.',
   true, true, true, 4.7,
   'https://picsum.photos/seed/breteame-gasfontan/400/400',
   array['https://picsum.photos/seed/breteame-gasfontan-1/600/400','https://picsum.photos/seed/breteame-gasfontan-2/600/400'],
   '+50688887777'),

  ('88888888-8888-4888-8888-888888888888',
   'Roberto Ureña Plomería',
   'fontaneria',
   'Alajuela, Centro',
   'Fontanero con 8 años en el oficio. Destaqueos, fugas ocultas, instalación de inodoros y lavatorios. Precios honestos.',
   false, false, true, 4.1,
   null,
   '{}',
   '+50688888888'),

  -- Electricidad adicional
  ('99999999-9999-4999-8999-999999999999',
   'ElectroHogar CR',
   'electricidad',
   'Escazú, Guachipelín',
   'Instalaciones eléctricas residenciales y automatización del hogar. Smart home, luces LED, paneles solares.',
   true, true, true, 4.8,
   'https://picsum.photos/seed/breteame-electrohogar/400/400',
   array['https://picsum.photos/seed/breteame-electrohogar-1/600/400','https://picsum.photos/seed/breteame-electrohogar-2/600/400'],
   '+50688889999'),

  ('f0f0f0f0-f0f0-4f0f-8f0f-f0f0f0f0f0f0',
   'Mauricio Vindas Eléctrico',
   'electricidad',
   'Cartago, Centro',
   'Electricista residencial e industrial. Revisión de paneles, interruptores y cableado. Atención en Cartago y La Unión.',
   true, false, true, 4.4,
   'https://picsum.photos/seed/breteame-mauricio/400/400',
   '{}',
   '+50688880101'),

  ('e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1',
   'Instalaciones Eléctricas GAM',
   'electricidad',
   'Desamparados, San José',
   'Toda clase de instalaciones eléctricas. Cumplimos con el Código Eléctrico Nacional. Presupuesto sin compromiso.',
   false, false, true, 3.9,
   null,
   '{}',
   '+50688880202'),

  -- Cerrajería adicional
  ('e2e2e2e2-e2e2-4e2e-8e2e-e2e2e2e2e2e2',
   'KeyMaster Escazú',
   'cerrajeria',
   'Escazú, Bello Horizonte',
   'Apertura de puertas sin daños, duplicado de llaves inteligentes y cerraduras de alta seguridad para condominios.',
   true, false, true, 4.5,
   'https://picsum.photos/seed/breteame-keymaster/400/400',
   '{}',
   '+50688880303'),

  ('e3e3e3e3-e3e3-4e3e-8e3e-e3e3e3e3e3e3',
   'Cerrajería Centro SJ',
   'cerrajeria',
   'San José, Barrio México',
   'Servicio rápido en San José. Apertura de carros, casas y cajas fuertes. Copias y reparaciones al instante.',
   false, false, true, 4.0,
   null,
   '{}',
   '+50688880404'),

  -- Jardinería adicional
  ('e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4',
   'Verde Limpio Heredia',
   'jardineria',
   'Heredia, Mercedes',
   'Mantenimiento semanal y quincenal de jardines. Poda de cercas vivas, siembra y fertilización.',
   true, true, true, 4.6,
   'https://picsum.photos/seed/breteame-verdelimpio/400/400',
   array['https://picsum.photos/seed/breteame-verdelimpio-1/600/400'],
   '+50688880505'),

  ('e5e5e5e5-e5e5-4e5e-8e5e-e5e5e5e5e5e5',
   'Don Rodrigo Jardinero',
   'jardineria',
   'Tibás, León XIII',
   'Jardinero de confianza con 20 años de experiencia. Poda, zacate, limpieza y siembra. Precios por hora o contrato.',
   false, false, true, 4.0,
   null,
   '{}',
   '+50688880606'),

  ('e6e6e6e6-e6e6-4e6e-8e6e-e6e6e6e6e6e6',
   'Jardines del Valle',
   'jardineria',
   'La Unión, Tres Ríos',
   'Diseño y mantenimiento de áreas verdes para casas, condominios y empresas. Especializados en jardines tropicales.',
   true, false, true, 4.3,
   'https://picsum.photos/seed/breteame-vallejardines/400/400',
   '{}',
   '+50688880707'),

  -- Escombreros adicional
  ('e7e7e7e7-e7e7-4e7e-8e7e-e7e7e7e7e7e7',
   'Escombros Express Heredia',
   'escombreros',
   'Heredia, Barva',
   'Retiro de escombros el mismo día. Vagoneta doble fondo. Servicio en Heredia, Alajuela y norte de San José.',
   true, false, true, 4.4,
   'https://picsum.photos/seed/breteame-escombrosexp/400/400',
   '{}',
   '+50688880808'),

  ('e8e8e8e8-e8e8-4e8e-8e8e-e8e8e8e8e8e8',
   'Remoción Norte GAM',
   'escombreros',
   'Alajuela, Guadalupe',
   'Demolición de paredes, retiro de muebles viejos y limpieza de lotes. Cotizamos gratis. Zona norte del GAM.',
   false, false, true, 3.8,
   null,
   '{}',
   '+50688880909')
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
