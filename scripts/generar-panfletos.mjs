// ============================================================================
// Breteame · Genera panfletos imprimibles (HTML → PDF) con QR de tracking.
// Cada QR apunta a /f/<slug>, que suma a stores.qr_scans y atribuye los leads.
//   - Zonas (publicidad de calle): desde scripts/zonas.mjs (no requiere DB).
//   - Ferreterías (partners): se leen de la tabla `stores` si hay service key.
// Salida: panfletos/index.html, panfletos/zonas.html, panfletos/ferreterias.html
// Uso:  node --env-file=.env.local scripts/generar-panfletos.mjs
//       PANFLETO_BASE_URL=https://breteame.cr node ... (sobrescribe la URL base)
// ============================================================================

import { mkdir, writeFile } from "node:fs/promises";
import QRCode from "qrcode";
import { zonasStores } from "./zonas.mjs";

const BASE = (
  process.env.PANFLETO_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://breteame.com"
).replace(/\/+$/, "");

const OUT = "panfletos";
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ---- Íconos (lucide, trazos) -----------------------------------------------
const ICONS = {
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  sprout:
    '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  shieldCheck:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
};

function svg(name, { size = 24, fill = false } = {}) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${
    fill ? "currentColor" : "none"
  }" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

const CATS = [
  ["wrench", "Fontanería"],
  ["zap", "Electricidad"],
  ["key", "Cerrajería"],
  ["sprout", "Jardinería"],
  ["truck", "Escombreros"],
];

async function qrSvg(target) {
  return QRCode.toString(target, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

function urlLabel() {
  return BASE.replace(/^https?:\/\//, "");
}

async function poster({ slug, ref }) {
  const target = `${BASE}/f/${slug}`;
  const qr = await qrSvg(target);
  const perks = [
    [svg("shieldCheck", { size: 20 }), "Profesionales verificados"],
    [svg("message", { size: 20 }), "Contacto directo por WhatsApp"],
    [svg("gift", { size: 20 }), "Sin comisiones, gratis para vos"],
  ]
    .map(([ic, t]) => `<span class="perk">${ic}${t}</span>`)
    .join("");
  const cats = CATS.map(
    ([ic, label]) =>
      `<span class="cat"><span class="ic">${svg(ic, { size: 30 })}</span>${label}</span>`,
  ).join("");

  return `<section class="poster">
  <div class="top">
    <div class="brand">
      <span class="mark">${svg("wrench", { size: 30, fill: true })}</span>
      <span class="name">Breteame</span>
    </div>
    <h1 class="headline">¿Necesitás un profesional de confianza?</h1>
    <p class="sub">Fontaneros, electricistas, cerrajeros, jardineros y escombreros <b>verificados</b>, cerca tuyo. Contactalos directo, sin intermediarios.</p>
  </div>
  <div class="mid">
    <div class="qrcard">${qr}</div>
    <p class="scan">Escaneá con la cámara de tu celular</p>
    <p class="url">${urlLabel()}</p>
  </div>
  <div class="bottom">
    <div class="perks">${perks}</div>
    <div class="cats">${cats}</div>
    <p class="ref">${ref}</p>
  </div>
</section>`;
}

const STYLE = `<style>
  @page { size: letter portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; }
  .poster { width: 8.5in; height: 11in; page-break-after: always; display: flex; flex-direction: column; overflow: hidden; }
  .poster:last-child { page-break-after: auto; }
  .top { background: linear-gradient(160deg, #2f6fe0, #1d3fb0); color: #fff; padding: 0.65in 0.7in 0.5in; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand .mark { width: 56px; height: 56px; border-radius: 14px; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; }
  .brand .name { font-size: 34px; font-weight: 800; letter-spacing: -.02em; }
  .headline { margin-top: 24px; font-size: 44px; line-height: 1.05; font-weight: 800; letter-spacing: -.02em; max-width: 6.2in; }
  .sub { margin-top: 14px; font-size: 19px; line-height: 1.45; color: rgba(255,255,255,.92); max-width: 6.3in; }
  .mid { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.2in; }
  .qrcard { background: #fff; border: 2px solid #e2e8f0; border-radius: 24px; padding: 20px; box-shadow: 0 12px 32px rgba(2,8,40,.14); }
  .qrcard svg { width: 2.9in; height: 2.9in; display: block; }
  .scan { margin-top: 18px; font-size: 23px; font-weight: 700; }
  .url { margin-top: 4px; font-size: 24px; font-weight: 800; color: #2f6fe0; }
  .bottom { padding: 0 0.7in 0.45in; }
  .perks { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .perk { display: inline-flex; align-items: center; gap: 8px; background: #f1f5f9; color: #334155; border-radius: 999px; padding: 9px 15px; font-size: 15px; font-weight: 600; }
  .cats { margin-top: 16px; display: flex; gap: 22px; justify-content: center; align-items: flex-start; color: #475569; }
  .cat { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }
  .cat .ic { color: #2f6fe0; }
  .ref { margin-top: 12px; text-align: center; font-size: 11px; color: #94a3b8; }
</style>`;

function doc(title, postersHtml) {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>${STYLE}</head>
<body>${postersHtml}</body>
</html>`;
}

async function fetchFerreterias() {
  if (!supaUrl || !serviceKey) return [];
  const zoneSlugs = new Set(zonasStores().map((z) => z.slug));
  try {
    const res = await fetch(
      `${supaUrl}/rest/v1/stores?select=name,slug&slug=not.is.null&order=name.asc`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const rows = await res.json();
    return rows.filter((s) => s.slug && !zoneSlugs.has(s.slug));
  } catch (err) {
    console.warn(`! No se pudieron leer ferreterías de la DB (${err.message}). Genero solo zonas.`);
    return [];
  }
}

// ---- Generación ------------------------------------------------------------
await mkdir(OUT, { recursive: true });

const zonas = zonasStores();
const zonasHtml = doc(
  "Breteame · Panfletos por zona",
  (await Promise.all(zonas.map((z) => poster({ slug: z.slug, ref: `${z.name} · ${BASE}/f/${z.slug}` })))).join("\n"),
);
await writeFile(`${OUT}/zonas.html`, zonasHtml);

const ferreterias = await fetchFerreterias();
let ferreteriasLine = "Ferreterías: ninguna en la DB (corré seed-zonas y/o agregá tiendas partner).";
if (ferreterias.length) {
  const ferreteriasHtml = doc(
    "Breteame · Panfletos por ferretería",
    (await Promise.all(ferreterias.map((f) => poster({ slug: f.slug, ref: `${f.name} · ${BASE}/f/${f.slug}` })))).join("\n"),
  );
  await writeFile(`${OUT}/ferreterias.html`, ferreteriasHtml);
  ferreteriasLine = `<a href="ferreterias.html">ferreterias.html</a> — ${ferreterias.length} ferretería(s) partner`;
}

const index = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Breteame · Panfletos</title>
<style>body{font-family:ui-sans-serif,system-ui,Arial,sans-serif;max-width:640px;margin:48px auto;padding:0 20px;color:#0f172a;line-height:1.6}h1{font-size:26px}a{color:#2f6fe0}code{background:#f1f5f9;padding:2px 6px;border-radius:6px}li{margin:6px 0}</style></head>
<body>
<h1>Panfletos de Breteame</h1>
<p>QR base: <code>${BASE}/f/&lt;slug&gt;</code> — cada escaneo suma a <code>stores.qr_scans</code> y atribuye los leads.</p>
<ul>
  <li><a href="zonas.html">zonas.html</a> — ${zonas.length} zonas (publicidad de calle, slug <code>&lt;provincia&gt;-&lt;canton&gt;</code>)</li>
  <li>${ferreteriasLine}</li>
</ul>
<h2>Para imprimir a PDF</h2>
<ol>
  <li>Abrí el archivo en el navegador y apretá <b>Ctrl/Cmd + P</b>.</li>
  <li>Destino: <b>Guardar como PDF</b>. Márgenes: <b>Ninguno</b>.</li>
  <li>Activá <b>Gráficos de fondo</b> para que salgan los colores.</li>
  <li>Para imprimir un solo panfleto, elegí el rango de páginas.</li>
</ol>
</body></html>`;
await writeFile(`${OUT}/index.html`, index);

console.log(`✓ Panfletos generados en ./${OUT}/`);
console.log(`  · zonas.html       → ${zonas.length} zonas`);
console.log(`  · ferreterias.html → ${ferreterias.length} ferreterías`);
console.log(`  · URL base: ${BASE}`);
