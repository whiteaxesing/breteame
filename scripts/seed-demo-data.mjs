// ============================================================================
// Breteame · Enriquece datos demo para el pitch (leads, vistas, reseñas,
// guardados) vía REST API. Pobla el dashboard de pro@demo.cr (Marvin) y la
// cuenta de cliente@demo.cr. Idempotente por un guard de conteo de leads.
// Uso: node --env-file=.env.local scripts/seed-demo-data.mjs
// ============================================================================

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
const H = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };

// Profesionales seed (ids conocidos).
const MARVIN = "11111111-1111-4111-8111-111111111111"; // fontanero (= pro@demo.cr)
const ELECTRO = "99999999-9999-4999-8999-999999999999"; // ElectroHogar CR
const CERRAJERO = "33333333-3333-4333-8333-333333333333"; // Llave Maestra 24/7
const JARDIN = "44444444-4444-4444-8444-444444444444"; // Jardines Pura Vida

async function userIdByEmail(email) {
  const res = await fetch(`${url}/auth/v1/admin/users?per_page=200`, { headers: H });
  const data = await res.json();
  const users = data.users ?? data;
  return users.find((u) => u.email === email)?.id;
}

async function insert(table, rows, prefer = "return=minimal") {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...H, Prefer: prefer },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
}

async function countOf(table, query) {
  const res = await fetch(`${url}/rest/v1/${table}?${query}&select=id`, {
    headers: { ...H, Prefer: "count=exact" },
  });
  const range = res.headers.get("content-range") ?? "*/0";
  return parseInt(range.split("/")[1] || "0", 10);
}

// Fecha ISO hace `d` días (y `h` horas).
const ago = (d, h = 0) => new Date(Date.now() - (d * 24 + h) * 3600_000).toISOString();

const cliente = await userIdByEmail("cliente@demo.cr");
if (!cliente) {
  console.error("No encontré cliente@demo.cr. Corré primero scripts/seed-users.mjs");
  process.exit(1);
}

// ---- Leads curados de Marvin (sentinela: María Rodríguez) ------------------
const tieneCurados = (await countOf("contacts", `professional_id=eq.${MARVIN}&client_name=eq.${encodeURIComponent("María Rodríguez")}`)) > 0;
if (tieneCurados) {
  console.log("= leads curados de Marvin ya existen.");
} else {
  const leads = [
    { name: "María Rodríguez", channel: "whatsapp", status: "cerrado", at: ago(9) },
    { name: "Carlos Vargas", channel: "llamada", status: "cerrado", at: ago(7, 3) },
    { name: "Ana Jiménez", channel: "whatsapp", status: "contactado", at: ago(4) },
    { name: "Luis Mora", channel: "whatsapp", status: "contactado", at: ago(2, 5) },
    { name: "Sofía Castro", channel: "copiar", status: "nuevo", at: ago(1) },
    { name: "Diego Herrera", channel: "whatsapp", status: "nuevo", at: ago(0, 4) },
  ].map((l) => ({
    professional_id: MARVIN,
    client_id: cliente,
    client_name: l.name,
    channel: l.channel,
    status: l.status,
    created_at: l.at,
  }));

  const historial = [
    { pro: ELECTRO, channel: "whatsapp", at: ago(6) },
    { pro: CERRAJERO, channel: "llamada", at: ago(12) },
    { pro: JARDIN, channel: "whatsapp", at: ago(20) },
  ].map((c) => ({
    professional_id: c.pro,
    client_id: cliente,
    client_name: "Cliente Demo",
    channel: c.channel,
    status: "nuevo",
    created_at: c.at,
  }));

  await insert("contacts", [...leads, ...historial]);
  console.log(`+ ${leads.length} leads curados de Marvin + ${historial.length} contactos del cliente.`);
}

// ---- Vistas de perfil de Marvin (para que la métrica no quede en 0) ---------
const vistasActuales = await countOf("profile_views", `professional_id=eq.${MARVIN}`);
if (vistasActuales >= 20) {
  console.log(`= Marvin ya tiene ${vistasActuales} vistas.`);
} else {
  const vistas = Array.from({ length: 34 }, (_, i) => ({
    professional_id: MARVIN,
    viewer_id: null,
    created_at: ago(i % 20, (i * 7) % 24),
  }));
  await insert("profile_views", vistas);
  console.log(`+ ${vistas.length} vistas de perfil de Marvin.`);
}

// ---- Guardados del cliente (idempotente por PK) ----------------------------
await insert(
  "saved_professionals",
  [MARVIN, ELECTRO, "e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4"].map((p) => ({
    client_id: cliente,
    professional_id: p,
  })),
  "resolution=ignore-duplicates,return=minimal",
);
console.log("+ guardados del cliente (favoritos).");

// ---- Reseñas: seed (client_id null) + una del cliente ----------------------
const resenasSeed = [
  { pro: MARVIN, name: "María Rodríguez", rating: 5, comment: "Llegó el mismo día y dejó la fuga como nueva. Súper recomendado." },
  { pro: MARVIN, name: "Carlos Vargas", rating: 5, comment: "Puntual, ordenado y precio justo. Volvería a contratarlo." },
  { pro: MARVIN, name: "Ana Jiménez", rating: 4, comment: "Buen trabajo con el calentador, todo quedó funcionando." },
  { pro: ELECTRO, name: "Roberto S.", rating: 5, comment: "Instalaron las luces LED de toda la casa, impecable." },
].map((r) => ({
  professional_id: r.pro,
  client_id: null,
  reviewer_name: r.name,
  rating: r.rating,
  comment: r.comment,
  created_at: ago(Math.floor(Math.random() * 25) + 3),
}));
await insert("reviews", resenasSeed, "resolution=ignore-duplicates,return=minimal");

await insert(
  "reviews",
  [{
    professional_id: ELECTRO,
    client_id: cliente,
    reviewer_name: "Cliente Demo",
    rating: 5,
    comment: "Respondieron al toque por WhatsApp y resolvieron rápido. Excelente.",
    created_at: ago(5),
  }],
  "resolution=ignore-duplicates,return=minimal",
);
console.log(`+ ${resenasSeed.length} reseñas seed + 1 reseña del cliente.`);

console.log("✓ Datos demo enriquecidos.");
