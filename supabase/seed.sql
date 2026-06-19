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
insert into public.stores (id, name, address, is_partner, qr_scans, slug)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Ferretería El Mar',        'Hatillo, San José',       true,  142, 'ferreteria-el-mar'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Depósito Los Ángeles',     'Heredia Centro',          true,   87, 'deposito-los-angeles'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'EPA San Sebastián',        'San Sebastián, San José', true,  230, 'epa-san-sebastian'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Ferretería Central',       'Alajuela Centro',         false,   0, 'ferreteria-central')
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
-- Reseñas genéricas de prueba (seed).
-- client_id = null porque no hay usuarios reales aún.
-- El trigger recalcular_rating_profesional() actualiza professionals.rating
-- automáticamente al insertar estas filas.
-- IDs fijos (00000000-0000-4000-8000-XXXXXXXXXXXX) para que el seed sea idempotente.
-- ============================================================================
insert into public.reviews (id, professional_id, client_id, reviewer_name, rating, comment, created_at)
values
  -- Marvin Jiménez (fontaneria) → promedio ~4.8
  ('00000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111',null,'María Fernanda Solano',5,'Excelente servicio, resolvió la fuga en menos de una hora. Muy puntual y profesional.','2025-11-15 10:23:00+00'),
  ('00000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111',null,'Andrés Quesada',5,'Marvin es muy serio y deja todo limpio. Ya es la segunda vez que lo contrato.','2025-12-03 14:45:00+00'),
  ('00000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111',null,'Patricia Ulate',5,'Lo llamé a las 9pm por una emergencia con el calentador y llegó enseguida. Muy agradecido.','2026-01-20 21:10:00+00'),
  ('00000000-0000-4000-8000-000000000004','11111111-1111-4111-8111-111111111111',null,'Diego Badilla',5,'Precio justo, buen trabajo y sin sorpresas. 100% recomendado.','2026-02-08 09:00:00+00'),
  ('00000000-0000-4000-8000-000000000005','11111111-1111-4111-8111-111111111111',null,'Carmen Vega',4,'Muy buen servicio, aunque tardó un poco más de lo acordado. El resultado fue excelente.','2026-03-12 16:30:00+00'),

  -- Carlos Mora (electricidad) → promedio ~4.5
  ('00000000-0000-4000-8000-000000000006','22222222-2222-4222-8222-222222222222',null,'Luis Araya',5,'Carlos solucionó un cortocircuito que otro técnico no pudo. Muy capacitado.','2025-12-10 11:15:00+00'),
  ('00000000-0000-4000-8000-000000000007','22222222-2222-4222-8222-222222222222',null,'Daniela Mora',4,'Buen trabajo, llegó un poco tarde pero el resultado estuvo bien.','2026-01-05 15:00:00+00'),
  ('00000000-0000-4000-8000-000000000008','22222222-2222-4222-8222-222222222222',null,'Jorge Calvo',5,'Profesional y ordenado. Dejó todo recogido al terminar. Lo recomiendo.','2026-02-22 10:30:00+00'),
  ('00000000-0000-4000-8000-000000000009','22222222-2222-4222-8222-222222222222',null,'Ana Ramírez',4,'Conoce bien su oficio. Precios razonables para Heredia.','2026-04-01 08:45:00+00'),

  -- Cerrajería Llave Maestra 24/7 (cerrajeria) → promedio ~4.8
  ('00000000-0000-4000-8000-000000000010','33333333-3333-4333-8333-333333333333',null,'Roberto Arias',5,'Se me olvidaron las llaves a medianoche y llegaron en 20 minutos. Salvadores totales.','2025-11-28 00:32:00+00'),
  ('00000000-0000-4000-8000-000000000011','33333333-3333-4333-8333-333333333333',null,'Silvia Mora',5,'Cambiaron el cilindro de mi casa rapidísimo y a buen precio. Muy satisfecha.','2026-01-14 13:20:00+00'),
  ('00000000-0000-4000-8000-000000000012','33333333-3333-4333-8333-333333333333',null,'Manuel Rojas',5,'Excelente atención a las 3am. Nunca imaginé que fueran tan rápidos.','2026-02-17 03:05:00+00'),
  ('00000000-0000-4000-8000-000000000013','33333333-3333-4333-8333-333333333333',null,'Laura Jiménez',4,'Muy buen servicio, solo que el precio fue un poco más alto de lo esperado.','2026-03-25 17:50:00+00'),
  ('00000000-0000-4000-8000-000000000014','33333333-3333-4333-8333-333333333333',null,'Eduardo Chavarría',5,'Rápidos, eficientes y amables. Lo mejor en cerrajería para Alajuela.','2026-04-18 12:00:00+00'),

  -- Jardines Pura Vida (jardineria) → promedio ~4.3
  ('00000000-0000-4000-8000-000000000015','44444444-4444-4444-8444-444444444444',null,'Gabriela Rodríguez',4,'Buen trabajo con el zacate, aunque hay que recordarles algunos detalles.','2026-01-08 09:30:00+00'),
  ('00000000-0000-4000-8000-000000000016','44444444-4444-4444-8444-444444444444',null,'Marco Solano',4,'El jardín quedó bien, son puntuales y el precio es justo.','2026-02-19 14:10:00+00'),
  ('00000000-0000-4000-8000-000000000017','44444444-4444-4444-8444-444444444444',null,'Isabel Picado',5,'Transformaron el jardín de la casa por completo. Quedé encantada.','2026-03-07 10:00:00+00'),
  ('00000000-0000-4000-8000-000000000018','44444444-4444-4444-8444-444444444444',null,'Oscar Bonilla',4,'Trabajan con ganas aunque a veces hay que supervisarlos un poco.','2026-04-22 16:00:00+00'),

  -- Acarreos y Demoliciones GAM (escombreros) → promedio ~4.6
  ('00000000-0000-4000-8000-000000000019','55555555-5555-4555-8555-555555555555',null,'Mauricio Castro',5,'Retiraron todos los escombros de la remodelación en pocas horas. Muy eficientes.','2025-12-18 08:00:00+00'),
  ('00000000-0000-4000-8000-000000000020','55555555-5555-4555-8555-555555555555',null,'Priscilla Méndez',5,'Precio justo y sin vueltas. Vinieron, recogieron todo y se fueron limpios.','2026-01-29 11:30:00+00'),
  ('00000000-0000-4000-8000-000000000021','55555555-5555-4555-8555-555555555555',null,'Carlos Fonseca',4,'Buen servicio, llegaron un poco tarde pero hicieron el trabajo correctamente.','2026-02-14 15:45:00+00'),
  ('00000000-0000-4000-8000-000000000022','55555555-5555-4555-8555-555555555555',null,'Ana Soto',4,'La vagoneta era grande así que fue rápido. Cumplen con lo prometido.','2026-03-30 09:15:00+00'),
  ('00000000-0000-4000-8000-000000000023','55555555-5555-4555-8555-555555555555',null,'David Vargas',5,'Los recomiendo. Rápidos y responsables.','2026-05-02 14:00:00+00'),

  -- Andrea Solís Fontanería (fontaneria) → promedio ~4.3
  ('00000000-0000-4000-8000-000000000024','66666666-6666-4666-8666-666666666666',null,'Miguel Ulate',4,'Buena fontanera, resolvió el problema de la llave del baño sin complicaciones.','2026-01-11 10:00:00+00'),
  ('00000000-0000-4000-8000-000000000025','66666666-6666-4666-8666-666666666666',null,'Laura Torres',4,'Llegó puntual y el trabajo estuvo bien. La recomiendo para trabajos pequeños.','2026-02-26 13:30:00+00'),
  ('00000000-0000-4000-8000-000000000026','66666666-6666-4666-8666-666666666666',null,'Sandra Vindas',5,'Excelente servicio, muy amable y explicó todo lo que hizo. 10/10.','2026-04-05 09:45:00+00'),
  ('00000000-0000-4000-8000-000000000027','66666666-6666-4666-8666-666666666666',null,'Pablo Arce',4,'Buen trabajo aunque tardó un poco en llegar. El resultado fue correcto.','2026-05-10 16:20:00+00'),

  -- Fontanería y Gas CR (fontaneria) → promedio ~4.8
  ('00000000-0000-4000-8000-000000000028','77777777-7777-4777-8777-777777777777',null,'Fabiola Monge',5,'Certificados por ARESEP y se nota. La instalación de gas quedó impecable.','2025-11-22 11:00:00+00'),
  ('00000000-0000-4000-8000-000000000029','77777777-7777-4777-8777-777777777777',null,'Hernán Varela',5,'Instalaron el calentador solar en un día. Muy profesionales y limpios.','2026-01-17 14:00:00+00'),
  ('00000000-0000-4000-8000-000000000030','77777777-7777-4777-8777-777777777777',null,'Melissa Bolaños',5,'El mejor servicio de gas que he contratado. Sin sorpresas en el precio.','2026-03-03 10:30:00+00'),
  ('00000000-0000-4000-8000-000000000031','77777777-7777-4777-8777-777777777777',null,'Rodrigo Salas',4,'Muy buen trabajo, un poco caros pero la calidad lo justifica.','2026-04-28 15:00:00+00'),

  -- Roberto Ureña Plomería (fontaneria) → promedio ~4.0
  ('00000000-0000-4000-8000-000000000032','88888888-8888-4888-8888-888888888888',null,'Jenny Montoya',4,'Resolvió la fuga de la cocina sin problema. Precio accesible.','2026-02-03 09:00:00+00'),
  ('00000000-0000-4000-8000-000000000033','88888888-8888-4888-8888-888888888888',null,'Alberto Gómez',4,'Buen fontanero, trabaja bien aunque tarda un poco en responder mensajes.','2026-03-18 11:15:00+00'),
  ('00000000-0000-4000-8000-000000000034','88888888-8888-4888-8888-888888888888',null,'Valeria Espinoza',4,'El trabajo quedó correcto. Precios honestos como dice en su anuncio.','2026-05-07 14:30:00+00'),

  -- ElectroHogar CR (electricidad) → promedio ~4.8
  ('00000000-0000-4000-8000-000000000035','99999999-9999-4999-8999-999999999999',null,'Óscar Jiménez',5,'Instalaron el sistema de iluminación inteligente de toda la casa. Un trabajo espectacular.','2025-12-05 10:00:00+00'),
  ('00000000-0000-4000-8000-000000000036','99999999-9999-4999-8999-999999999999',null,'Tatiana Arroyo',5,'Los paneles solares quedaron perfectos. Profesionales de verdad.','2026-01-23 13:00:00+00'),
  ('00000000-0000-4000-8000-000000000037','99999999-9999-4999-8999-999999999999',null,'Rafael Núñez',5,'La mejor empresa eléctrica que he contratado. Muy recomendados.','2026-02-28 09:30:00+00'),
  ('00000000-0000-4000-8000-000000000038','99999999-9999-4999-8999-999999999999',null,'Susana Zamora',5,'Puntuales, ordenados y el trabajo es de primera calidad.','2026-03-15 16:00:00+00'),
  ('00000000-0000-4000-8000-000000000039','99999999-9999-4999-8999-999999999999',null,'Felipe Castro',4,'Muy buen servicio, aunque los precios son un poco altos. Vale la pena.','2026-04-30 11:45:00+00'),

  -- Mauricio Vindas Eléctrico (electricidad) → promedio ~4.4
  ('00000000-0000-4000-8000-000000000040','f0f0f0f0-f0f0-4f0f-8f0f-f0f0f0f0f0f0',null,'Lucía Sancho',5,'Mauricio revisó mi panel eléctrico y encontró un peligro que otro no detectó. Muy serio.','2026-01-09 10:00:00+00'),
  ('00000000-0000-4000-8000-000000000041','f0f0f0f0-f0f0-4f0f-8f0f-f0f0f0f0f0f0',null,'Carlos Villalobos',4,'Buen servicio, resolvió el problema del breaker rápido.','2026-02-20 14:30:00+00'),
  ('00000000-0000-4000-8000-000000000042','f0f0f0f0-f0f0-4f0f-8f0f-f0f0f0f0f0f0',null,'Diana Salas',4,'Correcto y accesible. Lo recomiendo para problemas residenciales sencillos.','2026-03-28 09:15:00+00'),
  ('00000000-0000-4000-8000-000000000043','f0f0f0f0-f0f0-4f0f-8f0f-f0f0f0f0f0f0',null,'José Mora',4,'Llegó puntual y el trabajo estuvo bien.','2026-05-05 15:20:00+00'),
  ('00000000-0000-4000-8000-000000000044','f0f0f0f0-f0f0-4f0f-8f0f-f0f0f0f0f0f0',null,'Karla Ureña',5,'Excelente electricista, muy honesto con los precios.','2026-05-20 11:00:00+00'),

  -- Instalaciones Eléctricas GAM (electricidad) → promedio ~3.8
  ('00000000-0000-4000-8000-000000000045','e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1',null,'William Pérez',4,'Hicieron la instalación pero hubo que llamarlos de vuelta para ajustar unos detalles.','2026-02-11 10:00:00+00'),
  ('00000000-0000-4000-8000-000000000046','e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1',null,'Alejandra Muñoz',3,'El trabajo se demoró más de lo prometido y el acabado no fue el mejor.','2026-03-22 14:00:00+00'),
  ('00000000-0000-4000-8000-000000000047','e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1',null,'Roberto Ugalde',4,'Cumplen con el trabajo aunque hay que darles seguimiento.','2026-04-14 09:30:00+00'),
  ('00000000-0000-4000-8000-000000000048','e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1',null,'Mariana Chacón',4,'Precio económico y el trabajo básicamente bien.','2026-05-16 16:00:00+00'),

  -- KeyMaster Escazú (cerrajeria) → promedio ~4.5
  ('00000000-0000-4000-8000-000000000049','e2e2e2e2-e2e2-4e2e-8e2e-e2e2e2e2e2e2',null,'Nicolás Montero',5,'Abrieron la cerradura inteligente de mi carro sin dañar nada. Excelentes.','2026-01-30 17:00:00+00'),
  ('00000000-0000-4000-8000-000000000050','e2e2e2e2-e2e2-4e2e-8e2e-e2e2e2e2e2e2',null,'Sofía Arguedas',4,'Buen servicio, llegaron en un tiempo razonable.','2026-02-25 11:30:00+00'),
  ('00000000-0000-4000-8000-000000000051','e2e2e2e2-e2e2-4e2e-8e2e-e2e2e2e2e2e2',null,'Ricardo Brenes',5,'Cambiaron todas las cerraduras del condominio. Trabajo impecable.','2026-04-08 10:00:00+00'),
  ('00000000-0000-4000-8000-000000000052','e2e2e2e2-e2e2-4e2e-8e2e-e2e2e2e2e2e2',null,'Beatriz Salazar',4,'Buenos técnicos, precio justo aunque un poco más caro que otros.','2026-05-18 14:45:00+00'),

  -- Cerrajería Centro SJ (cerrajeria) → promedio ~4.0
  ('00000000-0000-4000-8000-000000000053','e3e3e3e3-e3e3-4e3e-8e3e-e3e3e3e3e3e3',null,'Hugo Méndez',4,'Resolvieron la apertura de la puerta rápido. Sin complicaciones.','2026-02-06 13:00:00+00'),
  ('00000000-0000-4000-8000-000000000054','e3e3e3e3-e3e3-4e3e-8e3e-e3e3e3e3e3e3',null,'Viviana Corrales',4,'Servicio correcto para San José centro. Llegan sin problema.','2026-03-19 10:15:00+00'),
  ('00000000-0000-4000-8000-000000000055','e3e3e3e3-e3e3-4e3e-8e3e-e3e3e3e3e3e3',null,'Armando Soto',4,'Hicieron la copia de las llaves bien. Precio normal.','2026-04-27 15:30:00+00'),

  -- Verde Limpio Heredia (jardineria) → promedio ~4.6
  ('00000000-0000-4000-8000-000000000056','e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4',null,'Catalina Leiva',5,'El jardín quedó hermoso. Los vuelvo a contratar mensualmente.','2026-01-06 10:30:00+00'),
  ('00000000-0000-4000-8000-000000000057','e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4',null,'Fernando Aguilar',4,'Buen servicio semanal, puntuales y sin drama.','2026-02-16 14:00:00+00'),
  ('00000000-0000-4000-8000-000000000058','e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4',null,'Elena Ramos',5,'Podaron los árboles perfectamente y dejaron todo limpio.','2026-03-24 09:00:00+00'),
  ('00000000-0000-4000-8000-000000000059','e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4',null,'Tomás Navarro',4,'Trabajo correcto y precio razonable para mantenimiento quincenal.','2026-04-12 16:30:00+00'),
  ('00000000-0000-4000-8000-000000000060','e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4',null,'Rebeca Hidalgo',5,'Excelentes para jardines tropicales. Muy conocedores de las plantas del país.','2026-05-25 11:00:00+00'),

  -- Don Rodrigo Jardinero (jardineria) → promedio ~4.0
  ('00000000-0000-4000-8000-000000000061','e5e5e5e5-e5e5-4e5e-8e5e-e5e5e5e5e5e5',null,'Alfredo Miranda',4,'Don Rodrigo es muy trabajador y cumplido. 20 años de experiencia se notan.','2026-02-09 08:30:00+00'),
  ('00000000-0000-4000-8000-000000000062','e5e5e5e5-e5e5-4e5e-8e5e-e5e5e5e5e5e5',null,'Pilar Campos',4,'Buen jardinero para trabajos sencillos. Precio por hora muy accesible.','2026-03-31 14:15:00+00'),
  ('00000000-0000-4000-8000-000000000063','e5e5e5e5-e5e5-4e5e-8e5e-e5e5e5e5e5e5',null,'Gerardo Segura',4,'Llegó puntual y el jardín quedó ordenado. Lo recomiendo para Tibás.','2026-05-13 10:45:00+00'),

  -- Jardines del Valle (jardineria) → promedio ~4.3
  ('00000000-0000-4000-8000-000000000064','e6e6e6e6-e6e6-4e6e-8e6e-e6e6e6e6e6e6',null,'Verónica Pérez',4,'Diseñaron el jardín de mi casa nueva. Quedó muy bonito y tropical.','2025-12-12 11:00:00+00'),
  ('00000000-0000-4000-8000-000000000065','e6e6e6e6-e6e6-4e6e-8e6e-e6e6e6e6e6e6',null,'Emilio Fallas',4,'Mantenimiento mensual correcto. Puntuales y responsables.','2026-01-27 14:30:00+00'),
  ('00000000-0000-4000-8000-000000000066','e6e6e6e6-e6e6-4e6e-8e6e-e6e6e6e6e6e6',null,'Natalia Quirós',5,'Transformaron un lote descuidado en un jardín precioso. 10 estrellas si pudiera.','2026-03-10 09:00:00+00'),
  ('00000000-0000-4000-8000-000000000067','e6e6e6e6-e6e6-4e6e-8e6e-e6e6e6e6e6e6',null,'Sebastián Chaves',4,'Buen servicio aunque los precios son un poco más altos que la competencia.','2026-05-01 15:00:00+00'),

  -- Escombros Express Heredia (escombreros) → promedio ~4.5
  ('00000000-0000-4000-8000-000000000068','e7e7e7e7-e7e7-4e7e-8e7e-e7e7e7e7e7e7',null,'Lorenzo Vásquez',5,'Llegaron el mismo día y se llevaron todo. Rapidísimos.','2026-01-16 07:30:00+00'),
  ('00000000-0000-4000-8000-000000000069','e7e7e7e7-e7e7-4e7e-8e7e-e7e7e7e7e7e7',null,'Claudia Sáenz',4,'Buen servicio de acarreo, precio justo para el volumen.','2026-02-28 13:00:00+00'),
  ('00000000-0000-4000-8000-000000000070','e7e7e7e7-e7e7-4e7e-8e7e-e7e7e7e7e7e7',null,'Ignacio Mora',5,'Retiraron los escombros de la demolición sin problema. Los recomiendo.','2026-04-03 10:00:00+00'),
  ('00000000-0000-4000-8000-000000000071','e7e7e7e7-e7e7-4e7e-8e7e-e7e7e7e7e7e7',null,'Patricia Cruz',4,'Bien, aunque la vagoneta llegó un poco tarde. Cumplieron con el trabajo.','2026-05-19 16:30:00+00'),

  -- Remoción Norte GAM (escombreros) → promedio ~3.8
  ('00000000-0000-4000-8000-000000000072','e8e8e8e8-e8e8-4e8e-8e8e-e8e8e8e8e8e8',null,'Andrés Méndez',4,'Hicieron el trabajo aunque hay que insistirles un poco.','2026-02-13 09:00:00+00'),
  ('00000000-0000-4000-8000-000000000073','e8e8e8e8-e8e8-4e8e-8e8e-e8e8e8e8e8e8',null,'Miriam Solórzano',4,'Precio accesible para el norte de Alajuela. El trabajo estuvo bien.','2026-03-26 14:30:00+00'),
  ('00000000-0000-4000-8000-000000000074','e8e8e8e8-e8e8-4e8e-8e8e-e8e8e8e8e8e8',null,'Ernesto Bravo',3,'Tardaron más de lo acordado y hubo que llamarlos para que terminaran.','2026-04-20 11:00:00+00'),
  ('00000000-0000-4000-8000-000000000075','e8e8e8e8-e8e8-4e8e-8e8e-e8e8e8e8e8e8',null,'Cecilia Ramírez',4,'Cotización rápida y precio justo. El trabajo fue correcto.','2026-05-28 15:00:00+00')

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
