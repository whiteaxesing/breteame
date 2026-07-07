-- 0018 · Suma "transporte_material" y "mudanzas" a las categorías permitidas.
-- Mantener en sync con CategorySlug (src/lib/types.ts) y CATEGORIES (src/lib/categories.ts).

alter table public.professionals
  drop constraint if exists professionals_category_check;

alter table public.professionals
  add constraint professionals_category_check
  check (category in (
    'fontaneria', 'electricidad', 'cerrajeria', 'jardineria', 'escombreros',
    'pintura', 'aires', 'carpinteria', 'ebanisteria', 'limpieza', 'piscinas',
    'hojalateria', 'maestro_obra', 'tanques_septicos', 'transporte_material',
    'mudanzas'
  ));
