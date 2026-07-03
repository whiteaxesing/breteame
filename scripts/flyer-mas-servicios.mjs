// ============================================================================
// Breteame · Flyer "¿Su oficio no está aquí?" (1080x1920, estado de WhatsApp)
// Dirigido a profesionales de oficios no listados todavía en la plataforma.
// CTA: responder al estado de WhatsApp para que los agreguemos.
// Uso:    node scripts/flyer-mas-servicios.mjs
//         PANFLETO_BASE_URL=https://breteame.cr node ...
// ============================================================================

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const BASE = (
  process.env.PANFLETO_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://breteame.com"
).replace(/\/+$/, "");

const OUT = "panfletos";

// ---- Íconos ----------------------------------------------------------------
const ICONS = {
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  sprout:
    '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  paintRoller:
    '<path d="M18 4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M10 10v6"/><path d="M8 16h4"/><path d="M10 16v4"/><path d="M8 20h4"/>',
  wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
  hammer:
    '<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>',
  armchair:
    '<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>',
  sparkles:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  waves:
    '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  checkCircle:
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
};

function svg(name, { size = 24, fill = false } = {}) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${
    fill ? "currentColor" : "none"
  }" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

// Categorías actuales en Breteame
const CATS = [
  { icon: "wrench",      label: "Fontanería",          color: "#2f6fe0" },
  { icon: "zap",         label: "Electricidad",         color: "#d97706" },
  { icon: "key",         label: "Cerrajería",           color: "#52525b" },
  { icon: "sprout",      label: "Jardinería",           color: "#2f6fe0" },
  { icon: "truck",       label: "Escombreros",          color: "#ea580c" },
  { icon: "paintRoller", label: "Pintura",              color: "#7c3aed" },
  { icon: "wind",        label: "Aires acondicionados", color: "#0284c7" },
  { icon: "hammer",      label: "Carpintería",          color: "#78716c" },
  { icon: "armchair",    label: "Ebanistería",          color: "#e11d48" },
  { icon: "sparkles",    label: "Limpieza profunda",    color: "#0d9488" },
  { icon: "waves",       label: "Piscinas",             color: "#0891b2" },
];

const catsHtml = CATS.map(
  ({ icon, label, color }) => `
  <span class="chip">
    <span class="chip-ic" style="color:${color}">${svg(icon, { size: 18 })}</span>
    ${label}
  </span>`,
).join("");

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Breteame · ¿Su oficio no está aquí?</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1e1b2e;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  /* ── Cabecera ─────────────────────────────────────────── */
  .top {
    background: linear-gradient(160deg, #2f6fe0, #1d3fb0);
    color: #fff;
    padding: 100px 76px 72px;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand .mark {
    width: 70px; height: 70px; border-radius: 19px;
    background: rgba(255,255,255,.18);
    display: flex; align-items: center; justify-content: center;
  }
  .brand .name { font-size: 42px; font-weight: 800; letter-spacing: -0.02em; }

  .headline {
    margin-top: 56px;
    font-size: 80px; line-height: 1.05;
    font-weight: 800; letter-spacing: -0.03em;
  }
  .headline em { font-style: normal; color: #bfdbfe; }
  .sub {
    margin-top: 28px; font-size: 34px; line-height: 1.5;
    color: rgba(255,255,255,.9); max-width: 900px;
  }

  /* ── Cuerpo ───────────────────────────────────────────── */
  .body { flex: 1; display: flex; flex-direction: column; padding: 64px 76px 72px; }

  .section-label {
    font-size: 22px; font-weight: 700; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 24px;
  }

  /* Chips de categorías */
  .chips { display: flex; flex-wrap: wrap; gap: 14px; }
  .chip {
    display: inline-flex; align-items: center; gap: 8px;
    background: #f1f5f9; border: 1px solid #e2e8f0;
    border-radius: 999px; padding: 10px 20px;
    font-size: 24px; font-weight: 600; color: #334155;
  }
  .chip-ic { display: flex; align-items: center; }

  /* Card CTA */
  .card {
    margin-top: 60px;
    background: #fff;
    border: 2px dashed #2f6fe0;
    border-radius: 32px;
    padding: 52px 52px;
    display: flex; flex-direction: column; gap: 28px;
    box-shadow: 0 12px 32px rgba(20,30,80,.08);
  }
  .card-title {
    font-size: 42px; font-weight: 800; color: #1d3fb0;
    line-height: 1.2;
  }
  .card-title em { font-style: normal; color: #2f6fe0; }
  .card-sub {
    font-size: 30px; color: #374151; line-height: 1.5;
  }

  .cta-row {
    display: flex; align-items: center; gap: 22px;
    background: #eff6ff; border-radius: 20px; padding: 24px 28px;
  }
  .cta-ic {
    flex: none; width: 72px; height: 72px; border-radius: 18px;
    background: #dbeafe; color: #2f6fe0;
    display: flex; align-items: center; justify-content: center;
  }
  .cta-text { font-size: 30px; font-weight: 700; color: #1d3fb0; line-height: 1.3; }

  .spacer { flex: 1; min-height: 20px; }
  .footer { text-align: center; font-size: 22px; color: #9ca3af; }
</style>
</head>
<body>
  <!-- Cabecera verde -->
  <div class="top">
    <div class="brand">
      <span class="mark">${svg("wrench", { size: 32, fill: true })}</span>
      <span class="name">Breteame</span>
    </div>
    <h1 class="headline">¿Su oficio<br /><em>no está aquí?</em></h1>
    <p class="sub">Escríbanos y lo agregamos <strong>gratis</strong>. En Breteame queremos conectar a todos los profesionales con sus clientes.</p>
  </div>

  <!-- Cuerpo -->
  <div class="body">
    <p class="section-label">Ya tenemos estos oficios</p>
    <div class="chips">${catsHtml}</div>

    <div class="card">
      <p class="card-title">¿Hace algo que<br /><em>no está en la lista?</em></p>
      <p class="card-sub">Pintores, soldadores, techadores, reparación de electrodomésticos, maestros de obra, vidrieros… cualquier oficio bienvenido.</p>
      <div class="cta-row">
        <span class="cta-ic">${svg("message", { size: 34 })}</span>
        <p class="cta-text">Responda a esta historia<br />y lo agregamos sin costo</p>
      </div>
      <div class="cta-row">
        <span class="cta-ic">${svg("checkCircle", { size: 34 })}</span>
        <p class="cta-text">Sin comisiones.<br />Los clientes le contactan directo.</p>
      </div>
    </div>

    <div class="spacer"></div>
    <p class="footer">breteame.com · Hecho en Costa Rica</p>
  </div>
</body>
</html>`;

await mkdir(OUT, { recursive: true });
const htmlPath = resolve(OUT, "mas-servicios.html");
await writeFile(htmlPath, html);
console.log(`✓ ${OUT}/mas-servicios.html`);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  const pngPath = resolve(OUT, "mas-servicios.png");
  await page.screenshot({ path: pngPath, type: "png" });
  console.log(`✓ ${OUT}/mas-servicios.png (1080x1920, listo para estado de WhatsApp)`);
} finally {
  await browser.close();
}
