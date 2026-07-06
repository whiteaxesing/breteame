-- Ferreterías reales del piloto de flyers con QR (Zona Norte).
-- Los flyers impresos apuntan a /f/el-colono y /f/coopelesca;
-- sin estas filas el redirect funciona pero el escaneo no se registra.
insert into public.stores (name, address, is_partner, qr_scans, slug)
values
  ('El Colono',            'Zona Norte', true, 0, 'el-colono'),
  ('Almacenes Coopelesca', 'Zona Norte', true, 0, 'coopelesca')
on conflict (slug) do nothing;
