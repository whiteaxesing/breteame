// ============================================================================
// Breteame · Renderiza los panfletos HTML a PDF (tamaño carta) con Puppeteer.
// Requiere haber corrido antes scripts/generar-panfletos.mjs.
// Uso: node scripts/panfletos-pdf.mjs
// ============================================================================

import { access, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const OUT = "panfletos";
const targets = ["zonas.html", "ferreterias.html"];

const present = [];
for (const f of targets) {
  try {
    await access(resolve(OUT, f));
    present.push(f);
  } catch {
    /* no existe, se omite */
  }
}

if (!present.length) {
  console.error(`No hay HTML en ./${OUT}/. Corré primero: node --env-file=.env.local scripts/generar-panfletos.mjs`);
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const file of present) {
    const page = await browser.newPage();
    const url = pathToFileURL(resolve(OUT, file)).href;
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdf = file.replace(/\.html$/, ".pdf");
    await page.pdf({
      path: resolve(OUT, pdf),
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    await page.close();
    console.log(`✓ ${OUT}/${pdf}`);
  }
} finally {
  await browser.close();
}

const files = (await readdir(OUT)).filter((f) => f.endsWith(".pdf"));
console.log(`Listo: ${files.length} PDF en ./${OUT}/`);
