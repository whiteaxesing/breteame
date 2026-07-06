// ============================================================================
// Breteame · Imágenes para Instagram (1080×1080 px)
// Genera dos tipos:
//   instagram/plataforma-{n}.png  — presentación de la plataforma
//   instagram/tip-{n}.png         — tips para clientes
//
// Uso: node --env-file=.env.local scripts/instagram.mjs
// ============================================================================

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const OUT = "instagram";
const W   = 1080;
const H   = 1080;

await mkdir(OUT, { recursive: true });

// ── Categorías ───────────────────────────────────────────────────────────────
const CATS = {
  fontaneria:       { label: "Fontanería",        color: "#2563eb", bg: "#dbeafe", icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' },
  electricidad:     { label: "Electricidad",      color: "#d97706", bg: "#fef3c7", icon: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>' },
  cerrajeria:       { label: "Cerrajería",        color: "#52525b", bg: "#f4f4f5", icon: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 1 1 1-1h1a1 1 0 0 1 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>' },
  jardineria:       { label: "Jardinería",        color: "#16a34a", bg: "#dcfce7", icon: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>' },
  pintura:          { label: "Pintura",           color: "#7c3aed", bg: "#ede9fe", icon: '<path d="M19 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 21h18"/>' },
  maestro_obra:     { label: "Maestro de obra",   color: "#b45309", bg: "#fef9c3", icon: '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/>' },
};

function catIcon(slug, size = 48) {
  const c = CATS[slug];
  if (!c) return "";
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:${c.color}">${c.icon}</svg>`;
}

// ── Puppeteer ────────────────────────────────────────────────────────────────
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

async function render(html, filename) {
  const htmlPath = resolve(OUT, filename.replace(".png", ".html"));
  await writeFile(htmlPath, html);
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.screenshot({ path: resolve(OUT, filename), type: "png" });
  await page.close();
  console.log(`✓ ${OUT}/${filename}`);
}

const BASE_STYLE = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: ${W}px; height: ${H}px; overflow: hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
}`;

// ─────────────────────────────────────────────────────────────────────────────
// TIPO 1: PLATAFORMA
// ─────────────────────────────────────────────────────────────────────────────
const PLATAFORMA_SLIDES = [
  {
    file: "plataforma-01.png",
    html: `<!doctype html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
body { background: linear-gradient(145deg, #1e40af, #3b82f6); color: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px; text-align: center; gap: 32px; }
.logo { font-size: 52px; font-weight: 900; letter-spacing: -0.03em; }
.tagline { font-size: 64px; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em;
  max-width: 880px; }
.sub { font-size: 30px; color: rgba(255,255,255,.8); max-width: 700px; line-height: 1.5; }
.url { margin-top: 16px; font-size: 34px; font-weight: 700;
  background: rgba(255,255,255,.18); border-radius: 50px; padding: 14px 44px; }
</style></head><body>
  <div class="logo">Breteame 🔧</div>
  <h1 class="tagline">El profesional que necesitás, en un clic</h1>
  <p class="sub">Fontaneros, electricistas, cerrajeros y más — verificados en Costa Rica.</p>
  <div class="url">breteame.com</div>
</body></html>`,
  },
  {
    file: "plataforma-02.png",
    html: `<!doctype html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
body { background: #fff; display: flex; flex-direction: column; padding: 72px; gap: 0; }
.header { margin-bottom: 48px; }
.logo { font-size: 36px; font-weight: 900; color: #2563eb; letter-spacing: -0.02em; }
h1 { font-size: 62px; font-weight: 800; color: #111827; line-height: 1.1;
  letter-spacing: -0.025em; margin-top: 16px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex: 1; }
.card { border: 2px solid #f3f4f6; border-radius: 24px; padding: 32px;
  display: flex; align-items: center; gap: 24px; }
.ic { width: 72px; height: 72px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center; flex: none; }
.label { font-size: 26px; font-weight: 700; color: #111827; }
.footer { margin-top: 32px; text-align: center; font-size: 22px; color: #6b7280; }
.footer strong { color: #2563eb; }
</style></head><body>
  <div class="header">
    <div class="logo">Breteame</div>
    <h1>¿Quién te puede ayudar hoy?</h1>
  </div>
  <div class="grid">
    ${["fontaneria","electricidad","cerrajeria","jardineria","pintura","maestro_obra"].map(slug => {
      const c = CATS[slug];
      return `<div class="card">
        <div class="ic" style="background:${c.bg}">${catIcon(slug, 38)}</div>
        <span class="label">${c.label}</span>
      </div>`;
    }).join("")}
  </div>
  <div class="footer">Y muchos más en <strong>breteame.com</strong></div>
</body></html>`,
  },
  {
    file: "plataforma-03.png",
    html: `<!doctype html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
body { background: #0f172a; color: #fff; display: flex; flex-direction: column;
  padding: 80px; justify-content: space-between; }
.logo { font-size: 36px; font-weight: 900; color: #60a5fa; }
.steps { display: flex; flex-direction: column; gap: 36px; flex: 1;
  justify-content: center; }
.step { display: flex; align-items: flex-start; gap: 32px; }
.num { width: 64px; height: 64px; border-radius: 50%; background: #2563eb;
  font-size: 30px; font-weight: 800; display: flex; align-items: center;
  justify-content: center; flex: none; }
.text h2 { font-size: 38px; font-weight: 800; line-height: 1.1; }
.text p  { font-size: 24px; color: rgba(255,255,255,.6); margin-top: 6px; }
.footer { text-align: center; font-size: 26px; color: #60a5fa; font-weight: 700; }
</style></head><body>
  <div class="logo">Breteame — Cómo funciona</div>
  <div class="steps">
    <div class="step">
      <div class="num">1</div>
      <div class="text">
        <h2>Buscás el profesional</h2>
        <p>Por oficio y zona, sin registro</p>
      </div>
    </div>
    <div class="step">
      <div class="num">2</div>
      <div class="text">
        <h2>Ves su perfil completo</h2>
        <p>Descripción, experiencia y reseñas</p>
      </div>
    </div>
    <div class="step">
      <div class="num">3</div>
      <div class="text">
        <h2>Lo contactás directo</h2>
        <p>Por WhatsApp o llamada, sin intermediarios</p>
      </div>
    </div>
  </div>
  <div class="footer">breteame.com · Gratis · Hecho en Costa Rica 🇨🇷</div>
</body></html>`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIPO 2: TIPS
// ─────────────────────────────────────────────────────────────────────────────
const TIPS = [
  {
    file: "tip-01.png",
    num: "01",
    titulo: "Pedí referencias antes de contratar",
    cuerpo: "Un buen profesional tiene clientes anteriores que pueden hablar por su trabajo. No dudés en pedir dos o tres contactos y llamarlos.",
    color: "#2563eb",
    bg: "#dbeafe",
  },
  {
    file: "tip-02.png",
    num: "02",
    titulo: "Coordiná el precio antes de empezar",
    cuerpo: "Definí claramente el costo total o el cobro por hora antes de que empiece el trabajo. Los malos entendidos en el precio son la causa #1 de conflictos.",
    color: "#16a34a",
    bg: "#dcfce7",
  },
  {
    file: "tip-03.png",
    num: "03",
    titulo: "Desconfiá si te piden todo pago por adelantado",
    cuerpo: "Lo normal es pagar materiales al inicio y mano de obra al terminar. Si alguien exige el 100% antes de empezar, es una señal de alerta.",
    color: "#dc2626",
    bg: "#fee2e2",
  },
  {
    file: "tip-04.png",
    num: "04",
    titulo: "Preguntá cuántos años lleva en el oficio",
    cuerpo: "La experiencia importa. Un profesional con años en su oficio ya ha visto los problemas difíciles y sabe cómo resolverlos.",
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    file: "tip-05.png",
    num: "05",
    titulo: "Buscá profesionales verificados en Breteame",
    cuerpo: "En Breteame verificamos la identidad y el oficio de cada profesional antes de mostrarlos. Encontrás el perfil, reseñas y los contactás directo.",
    color: "#7c3aed",
    bg: "#ede9fe",
  },
];

function tipCard(tip) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
body { background: ${tip.bg}; display: flex; flex-direction: column;
  padding: 80px; justify-content: space-between; }
.num { font-size: 160px; font-weight: 900; color: ${tip.color};
  opacity: .15; line-height: 1; letter-spacing: -0.05em; margin-bottom: -32px; }
.content { display: flex; flex-direction: column; gap: 32px; flex: 1; justify-content: center; }
.label { font-size: 22px; font-weight: 700; color: ${tip.color};
  text-transform: uppercase; letter-spacing: 0.1em; }
h1 { font-size: 62px; font-weight: 900; color: #111827;
  line-height: 1.1; letter-spacing: -0.025em; }
p { font-size: 30px; color: #374151; line-height: 1.55; }
.footer { font-size: 24px; font-weight: 700; color: ${tip.color}; }
</style></head><body>
  <div class="num">${tip.num}</div>
  <div class="content">
    <div class="label">Tip para clientes</div>
    <h1>${tip.titulo}</h1>
    <p>${tip.cuerpo}</p>
  </div>
  <div class="footer">breteame.com · Profesionales verificados en Costa Rica 🇨🇷</div>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAR TODO
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n📸 Generando imágenes de Instagram...\n");

console.log("── Plataforma ──");
for (const slide of PLATAFORMA_SLIDES) {
  await render(slide.html, slide.file);
}

console.log("\n── Tips ──");
for (const tip of TIPS) {
  await render(tipCard(tip), tip.file);
}

await browser.close();
console.log(`\n✅ Listo. Imágenes en la carpeta /${OUT}/`);
