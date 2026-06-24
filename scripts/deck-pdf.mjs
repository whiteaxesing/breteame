// ============================================================================
// Breteame · Exporta el pitch deck (presentacion/index.html) a PDF 16:9 y deja
// algunas vistas previas PNG para verificación. Uso: node scripts/deck-pdf.mjs
// ============================================================================

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const file = resolve("presentacion/index.html");
const url = pathToFileURL(file).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
try {
  // ---- PDF (modo print: todas las slides apiladas) ----
  const p = await browser.newPage();
  await p.goto(`${url}?print=1`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(1500);
  await p.pdf({
    path: "presentacion/breteame-pitch.pdf",
    width: "1280px",
    height: "720px",
    printBackground: true,
    pageRanges: "1-13",
  });
  console.log("✓ presentacion/breteame-pitch.pdf");
  await p.close();

  // ---- Vistas previas de algunas slides (modo pantalla) ----
  await mkdir("presentacion/preview", { recursive: true });
  const pv = await browser.newPage();
  await pv.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await pv.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  const wanted = [2, 3, 6, 12, 13];
  let current = 1;
  for (const target of wanted) {
    while (current < target) { await pv.keyboard.press("ArrowRight"); current++; await sleep(150); }
    await sleep(400);
    await pv.screenshot({ path: `presentacion/preview/slide-${String(target).padStart(2, "0")}.png` });
    console.log(`✓ preview slide ${target}`);
  }
  await pv.close();
} finally {
  await browser.close();
}
console.log("Listo.");
