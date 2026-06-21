// ============================================================================
// Breteame · Genera un flyer vertical (formato estado de WhatsApp, 1080x1920)
// para reclutar profesionales (fontaneros, electricistas, etc.) vía contactos
// personales. CTA por link y por respuesta directa al estado (sin QR: la
// audiencia son señores que no necesariamente usan códigos QR).
// Salida: panfletos/reclutamiento.html y panfletos/reclutamiento.png
// Uso:    node scripts/flyer-reclutamiento.mjs
//         PANFLETO_BASE_URL=https://breteame.cr node ... (sobrescribe la URL)
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
const TARGET = `${BASE}/unirse`;

// ---- Íconos (lucide, trazos) -----------------------------------------------
const ICONS = {
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  sprout:
    '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  shieldCheck:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
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
];

const PERKS = [
  ["gift", "Gratis, sin comisiones"],
  ["message", "Los clientes le escriben directo por WhatsApp"],
  ["shieldCheck", "Un perfil verificado genera más confianza"],
];

const catsHtml = CATS.map(
  ([ic, label]) => `<span class="cat"><span class="ic">${svg(ic, { size: 26 })}</span>${label}</span>`,
).join("");

const perksHtml = PERKS.map(
  ([ic, label]) => `<li>${svg(ic, { size: 22 })}<span>${label}</span></li>`,
).join("");

const urlLabel = TARGET.replace(/^https?:\/\//, "");

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Breteame · Flyer reclutamiento profesionales</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { width: 1080px; height: 1920px; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1e1b2e;
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .top { background: linear-gradient(160deg, #2f6fe0, #1d3fb0); color: #fff; padding: 100px 76px 80px; }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand .mark { width: 70px; height: 70px; border-radius: 19px; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; }
  .brand .name { font-size: 42px; font-weight: 800; letter-spacing: -0.02em; }
  .headline { margin-top: 60px; font-size: 76px; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em; }
  .sub { margin-top: 28px; font-size: 34px; line-height: 1.5; color: rgba(255,255,255,.92); max-width: 880px; }

  .body { flex: 1; display: flex; flex-direction: column; padding: 76px 76px 80px; }
  .cats { display: flex; gap: 24px; justify-content: space-between; }
  .cat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 14px; font-size: 20px; font-weight: 600; text-align: center; color: #44415a; }
  .cat .ic { width: 72px; height: 72px; border-radius: 18px; background: #f1f5f9; color: #2f6fe0; display: flex; align-items: center; justify-content: center; }

  .card { margin-top: 88px; background: #fff; border: 1px solid #e4e4e9; border-radius: 32px; padding: 56px 48px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 18px 40px rgba(20,20,50,.08); }
  .cta-row { display: flex; align-items: center; gap: 22px; }
  .cta-row .ic-lg { flex: none; width: 76px; height: 76px; border-radius: 20px; background: #f1f5f9; color: #2f6fe0; display: flex; align-items: center; justify-content: center; }
  .cta-row .cta-text { font-size: 32px; font-weight: 700; line-height: 1.3; color: #1e1b2e; text-align: left; }
  .or { margin: 34px 0; font-size: 24px; font-weight: 600; color: #8b889a; }
  .card .url { font-size: 36px; font-weight: 800; color: #2f6fe0; }

  ul.perks { margin-top: 84px; list-style: none; display: flex; flex-direction: column; gap: 32px; }
  ul.perks li { display: flex; align-items: center; gap: 20px; font-size: 31px; font-weight: 600; color: #2c2a3d; }
  ul.perks li .ic { flex: none; width: 50px; height: 50px; border-radius: 13px; background: #f1f5f9; color: #2f6fe0; display: flex; align-items: center; justify-content: center; }

  .spacer { flex: 1; min-height: 40px; }
  .footer { text-align: center; font-size: 22px; color: #8b889a; }
</style>
</head>
<body>
  <div class="top">
    <div class="brand">
      <span class="mark">${svg("wrench", { size: 32, fill: true })}</span>
      <span class="name">Breteame</span>
    </div>
    <h1 class="headline">¿Es fontanero, electricista, cerrajero o jardinero?</h1>
    <p class="sub">Inscríbase gratis en Breteame para que los clientes lo contacten directo por WhatsApp.</p>
  </div>

  <div class="body">
    <div class="cats">${catsHtml}</div>

    <div class="card">
      <div class="cta-row">
        <span class="ic-lg">${svg("message", { size: 36 })}</span>
        <p class="cta-text">Responda a esta historia<br />para más información</p>
      </div>
      <p class="or">o entre directo al link</p>
      <div class="cta-row">
        <span class="ic-lg">${svg("link", { size: 36 })}</span>
        <p class="url">${urlLabel}</p>
      </div>
    </div>

    <ul class="perks">${perksHtml.replaceAll('<svg', '<span class="ic"><svg').replaceAll('</svg>', "</svg></span>")}</ul>

    <div class="spacer"></div>
    <p class="footer">Hecho en Costa Rica</p>
  </div>
</body>
</html>`;

await mkdir(OUT, { recursive: true });
const htmlPath = resolve(OUT, "reclutamiento.html");
await writeFile(htmlPath, html);
console.log(`✓ ${OUT}/reclutamiento.html`);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  const pngPath = resolve(OUT, "reclutamiento.png");
  await page.screenshot({ path: pngPath, type: "png" });
  console.log(`✓ ${OUT}/reclutamiento.png (1080x1920, listo para el estado de WhatsApp)`);
} finally {
  await browser.close();
}
