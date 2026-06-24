// ============================================================================
// Breteame · Captura el HTML real de la app (3 modos de usuario, desktop +
// mobile) para el pitch deck. Requiere el dev server en localhost:3000 y las
// cuentas demo (scripts/seed-users.mjs). Salida: presentacion/shots/*.png
// Uso: node scripts/capturas-pitch.mjs
// ============================================================================

import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer";

const BASE = process.env.CAP_BASE || "http://localhost:3000";
const MARVIN = "11111111-1111-4111-8111-111111111111";
const OUT = "presentacion/shots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2 };
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

async function login(ctx, email) {
  const page = await ctx.newPage();
  await page.setViewport(DESKTOP);
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle0", timeout: 45000 });
  await page.type("#email", email);
  await page.type("#password", "demo1234");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 45000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await sleep(1200);
  await page.close();
}

async function shot(ctx, name, url, { mobile = false, dark = false, fullPage = true, height } = {}) {
  const page = await ctx.newPage();
  const vp = mobile ? MOBILE : { ...DESKTOP, ...(height ? { height } : {}) };
  await page.setViewport(vp);
  // Forzar claro por defecto (headless usa dark); el flair usa dark explícito.
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: dark ? "dark" : "light" },
  ]);
  try {
    await page.goto(`${BASE}${url}`, { waitUntil: "networkidle0", timeout: 45000 });
    await sleep(1600);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
    console.log(`✓ ${name}`);
  } catch (e) {
    console.warn(`✗ ${name}: ${e.message}`);
  }
  await page.close();
}

try {
  // ---- Anónimo / público ----
  const anon = await browser.createBrowserContext();
  await shot(anon, "01-home-desktop", "/");
  await shot(anon, "02-pro-anon-desktop", `/pro/${MARVIN}`);
  await shot(anon, "07-home-mobile", "/", { mobile: true });
  await shot(anon, "12-home-dark-desktop", "/", { dark: true });
  await anon.close();

  // ---- Cliente ----
  const cli = await browser.createBrowserContext();
  await login(cli, "cliente@demo.cr");
  await shot(cli, "03-pro-cliente-desktop", `/pro/${MARVIN}`);
  await shot(cli, "04-cuenta-desktop", "/cuenta");
  await shot(cli, "08-pro-cliente-mobile", `/pro/${MARVIN}`, { mobile: true });
  await shot(cli, "09-cuenta-mobile", "/cuenta", { mobile: true });
  await cli.close();

  // ---- Profesional ----
  const pro = await browser.createBrowserContext();
  await login(pro, "pro@demo.cr");
  await shot(pro, "05-dashboard-desktop", "/dashboard");
  await shot(pro, "10-dashboard-mobile", "/dashboard", { mobile: true });
  await pro.close();

  // ---- Admin ----
  const adm = await browser.createBrowserContext();
  await login(adm, "admin@demo.cr");
  await shot(adm, "06-admin-desktop", "/admin", { fullPage: false, height: 1040 });
  await shot(adm, "11-admin-mobile", "/admin", { mobile: true, fullPage: false });
  await adm.close();
} finally {
  await browser.close();
}
console.log("Listo.");
