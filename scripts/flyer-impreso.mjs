// ============================================================================
// Breteame · Flyers para imprimir (formato carta, 2550x3300 px = letter 300dpi)
// Genera dos archivos:
//   panfletos/impreso-profesionales.png  — con tiras recortables al pie
//   panfletos/impreso-clientes.png       — para clientes del supermercado
// Uso: node scripts/flyer-impreso.mjs
// ============================================================================

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const OUT   = "panfletos";
const PHONE = "8678-7558";
const URL   = "breteame.com";
const W     = 1275; // px viewport (letter a 150dpi)
const H     = 1650;

// ── íconos ──────────────────────────────────────────────────────────────────
const ICONS = {
  wrench:    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  zap:       '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  key:       '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  sprout:    '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  gift:      '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  shield:    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  phone:     '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  scissors:  '<path d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/><path d="M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>',
  truck:     '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  star:      '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  globe:     '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
};

function svg(name, { size = 24, fill = false } = {}) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fill ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

// ── FLYER 1: PROFESIONALES ───────────────────────────────────────────────────
const OFICIOS = [
  ["wrench", "Fontanería"],
  ["zap",    "Electricidad"],
  ["key",    "Cerrajería"],
  ["sprout", "Jardinería"],
];

// 8 tiras recortables con el teléfono
const tiras = Array.from({ length: 8 }, () => `
  <div class="tira">
    ${svg("phone", { size: 14 })}
    <span>${PHONE}</span>
  </div>`).join("");

const htmlPro = `<!doctype html><html lang="es"><head><meta charset="utf-8"/>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #1e1b2e; background: #fff; display: flex; flex-direction: column; }

/* Cabecera azul */
.top { background: linear-gradient(160deg, #2f6fe0, #1d3fb0); color: #fff;
  padding: 52px 64px 50px; }
.brand { display: flex; align-items: center; gap: 14px; }
.brand .mark { width: 56px; height: 56px; border-radius: 14px;
  background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; }
.brand .name { font-size: 34px; font-weight: 800; letter-spacing: -0.02em; }
.headline { margin-top: 32px; font-size: 60px; font-weight: 800;
  line-height: 1.08; letter-spacing: -0.025em; }
.sub { margin-top: 18px; font-size: 25px; line-height: 1.45;
  color: rgba(255,255,255,.92); }

/* Cuerpo */
.body { flex: 1; display: flex; flex-direction: column; padding: 44px 64px 0; }

.oficios { display: flex; gap: 12px; justify-content: space-between; }
.oficio { flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 12px; font-size: 18px; font-weight: 700; color: #44415a; }
.oficio .ic { width: 72px; height: 72px; border-radius: 18px;
  background: #f1f5f9; color: #2f6fe0;
  display: flex; align-items: center; justify-content: center; }

.y-mas { margin-top: 18px; text-align: center; font-size: 18px; color: #6b7280;
  font-style: italic; }

/* Beneficios */
.perks { margin-top: 32px; display: flex; flex-direction: column; gap: 20px; }
.perk { display: flex; align-items: center; gap: 18px;
  font-size: 22px; font-weight: 600; color: #2c2a3d; }
.perk-ic { flex: none; width: 48px; height: 48px; border-radius: 12px;
  background: #f1f5f9; color: #2f6fe0;
  display: flex; align-items: center; justify-content: center; }

/* CTA grande — crece para llenar el espacio disponible */
.cta-box { flex: 1; margin-top: 32px; background: #f1f5f9; border-radius: 24px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 32px 40px; }
.cta-label { font-size: 22px; color: #6b7280; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.06em; }
.cta-phone { font-size: 80px; font-weight: 900; color: #2f6fe0;
  letter-spacing: 0.02em; line-height: 1.05; margin-top: 8px; }
.cta-sub { font-size: 20px; color: #6b7280; margin-top: 10px; }

/* Tiras recortables */
.tiras-wrap { border-top: 2px dashed #cbd5e1; margin-top: 24px; }
.tiras-label { text-align: center; font-size: 13px; color: #9ca3af;
  padding: 6px 0; display: flex; align-items: center; justify-content: center; gap: 6px; }
.tiras { display: flex; }
.tira { flex: 1; border-left: 1px dashed #cbd5e1; padding: 12px 6px;
  display: flex; flex-direction: column; align-items: center;
  gap: 5px; font-size: 13px; font-weight: 700; color: #2f6fe0;
  writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); }
.tira:last-child { border-right: 1px dashed #cbd5e1; }
.tira svg { transform: rotate(90deg); }
</style></head><body>
<div class="top">
  <div class="brand">
    <span class="mark">${svg("wrench", { size: 28, fill: true })}</span>
    <span class="name">Breteame</span>
  </div>
  <h1 class="headline">¿Trabaja en un oficio<br>y quiere más clientes?</h1>
  <p class="sub">Inscríbase gratis y los clientes lo contactan directo por WhatsApp.</p>
</div>

<div class="body">
  <div class="oficios">
    ${OFICIOS.map(([ic, l]) => `<div class="oficio"><span class="ic">${svg(ic, { size: 34 })}</span>${l}</div>`).join("")}
  </div>
  <p class="y-mas">Y también: pintores, maestros de obra, acarreos, techadores y más</p>

  <div class="perks">
    <div class="perk"><span class="perk-ic">${svg("gift", { size: 22 })}</span>Completamente gratis, sin comisiones</div>
    <div class="perk"><span class="perk-ic">${svg("shield", { size: 22 })}</span>Perfil verificado para generar más confianza</div>
    <div class="perk"><span class="perk-ic">${svg("star", { size: 22 })}</span>Su oficio llega a clientes en todo el GAM</div>
  </div>

  <div class="cta-box">
    <p class="cta-label">Para inscribirse, llame al</p>
    <p class="cta-phone">${PHONE}</p>
    <p class="cta-sub">o entre a <strong>${URL}/unirse</strong></p>
  </div>

  <div class="tiras-wrap">
    <p class="tiras-label">${svg("scissors", { size: 14 })} Recorte y guarde el número</p>
    <div class="tiras">${tiras}</div>
  </div>
</div>
</body></html>`;

// ── FLYER 2: CLIENTES ────────────────────────────────────────────────────────
const SERVICIOS_CLI = [
  ["wrench", "Fontaneros",    "#2f6fe0"],
  ["zap",    "Electricistas", "#d97706"],
  ["key",    "Cerrajeros",    "#52525b"],
  ["sprout", "Jardineros",    "#16a34a"],
  ["truck",  "Escombreros",   "#ea580c"],
];

const htmlCli = `<!doctype html><html lang="es"><head><meta charset="utf-8"/>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #1e1b2e; background: #fff; display: flex; flex-direction: column; }

.top { background: linear-gradient(160deg, #2f6fe0, #1d3fb0); color: #fff;
  padding: 52px 64px 50px; }
.brand { display: flex; align-items: center; gap: 14px; }
.brand .mark { width: 56px; height: 56px; border-radius: 14px;
  background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; }
.brand .name { font-size: 34px; font-weight: 800; letter-spacing: -0.02em; }
.headline { margin-top: 32px; font-size: 58px; font-weight: 800;
  line-height: 1.08; letter-spacing: -0.025em; }
.sub { margin-top: 18px; font-size: 24px; line-height: 1.45;
  color: rgba(255,255,255,.92); }

.body { flex: 1; display: flex; flex-direction: column; padding: 44px 64px 48px; }

/* 5 categorías en 2+3 o grid con wrap */
.grid { display: flex; flex-wrap: wrap; gap: 16px; }
.card { flex: 0 0 calc(50% - 8px); border: 2px solid #e4e4e9; border-radius: 20px;
  padding: 26px 22px; display: flex; align-items: center; gap: 16px; }
.card:last-child { flex: 0 0 100%; }
.card .ic { flex: none; width: 60px; height: 60px; border-radius: 14px;
  background: #f8fafc; display: flex; align-items: center; justify-content: center; }
.card .label { font-size: 23px; font-weight: 700; }

.how { margin-top: 32px; background: #f8fafc; border-radius: 22px;
  padding: 32px 36px; }
.how-title { font-size: 19px; font-weight: 700; color: #44415a;
  text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 22px; }
.steps { display: flex; flex-direction: column; gap: 18px; }
.step { display: flex; align-items: center; gap: 18px; }
.step-num { flex: none; width: 40px; height: 40px; border-radius: 50%;
  background: #2f6fe0; color: #fff; font-size: 20px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; }
.step-text { font-size: 21px; font-weight: 600; color: #374151; }

/* CTA azul que crece para llenar el espacio restante */
.cta-box { flex: 1; margin-top: 28px; text-align: center;
  background: linear-gradient(160deg, #2f6fe0, #1d3fb0);
  border-radius: 22px; padding: 32px 40px; color: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center; }
.cta-label { font-size: 21px; font-weight: 600; color: rgba(255,255,255,.85); }
.cta-url { font-size: 62px; font-weight: 900; letter-spacing: -0.01em;
  margin-top: 8px; }
.cta-sub { font-size: 19px; color: rgba(255,255,255,.75); margin-top: 10px; }
</style></head><body>
<div class="top">
  <div class="brand">
    <span class="mark">${svg("wrench", { size: 28, fill: true })}</span>
    <span class="name">Breteame</span>
  </div>
  <h1 class="headline">¿Necesita un profesional<br>de confianza?</h1>
  <p class="sub">Encuentre fontaneros, electricistas, cerrajeros y más — verificados y cerca de usted.</p>
</div>

<div class="body">
  <div class="grid">
    ${SERVICIOS_CLI.map(([ic, l, c]) => `
    <div class="card">
      <span class="ic" style="color:${c}">${svg(ic, { size: 32 })}</span>
      <span class="label">${l}</span>
    </div>`).join("")}
  </div>

  <div class="how">
    <p class="how-title">¿Cómo funciona?</p>
    <div class="steps">
      <div class="step"><span class="step-num">1</span><span class="step-text">Busque el profesional que necesita</span></div>
      <div class="step"><span class="step-num">2</span><span class="step-text">Vea su perfil y reseñas de otros clientes</span></div>
      <div class="step"><span class="step-num">3</span><span class="step-text">Contáctelo directo por WhatsApp o llamada</span></div>
    </div>
  </div>

  <div class="cta-box">
    <p class="cta-label">Encuéntrenos en</p>
    <p class="cta-url">${URL}</p>
    <p class="cta-sub">Gratis · Sin registro obligatorio · Hecho en Costa Rica</p>
  </div>
</div>
</body></html>`;

// ── Generar PNGs ─────────────────────────────────────────────────────────────
await mkdir(OUT, { recursive: true });

const browser = await (await import("puppeteer")).default.launch({
  headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

async function render(html, filename) {
  const htmlPath = resolve(OUT, filename.replace(".png", ".html"));
  await writeFile(htmlPath, html);
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  const pngPath = resolve(OUT, filename);
  await page.screenshot({ path: pngPath, type: "png" });
  await page.close();
  console.log(`✓ ${OUT}/${filename}`);
}

try {
  await render(htmlPro, "impreso-profesionales.png");
  await render(htmlCli, "impreso-clientes.png");
} finally {
  await browser.close();
}
