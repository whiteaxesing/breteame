// ============================================================================
// Breteame · Crea/actualiza pseudo-stores por zona vía REST API (HTTP).
// Sirven para trackear escaneos de publicidad de calle (sin ferretería real):
// el QR apunta a /f/<provincia>-<canton> y suma a stores.qr_scans igual que
// una ferretería. Idempotente: upsert por slug.
// Uso: node --env-file=.env.local scripts/seed-zonas.mjs
// ============================================================================

import { zonasStores } from "./zonas.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

async function upsert(table, rows, onConflict) {
  const qs = onConflict ? `?on_conflict=${onConflict}` : "";
  const res = await fetch(`${url}/rest/v1/${table}${qs}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      // ignore-duplicates: no pisa qr_scans existentes si la zona ya existe.
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
}

const rows = zonasStores().map((z) => ({ ...z, is_partner: false }));

try {
  await upsert("stores", rows, "slug");
  console.log(`✓ ${rows.length} zonas listas como pseudo-stores (slug <provincia>-<canton>).`);
} catch (err) {
  console.error("✗ Error:", err.message);
  process.exit(1);
}
