// ============================================================================
// Breteame · Corre archivos .sql contra la base usando DATABASE_URL.
// Uso:
//   node --env-file=.env.local scripts/run-sql.mjs supabase/migrations/0001_init.sql supabase/seed.sql
// ============================================================================

import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL en .env.local");
  process.exit(1);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Pasá al menos un archivo .sql");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }, // Supabase usa SSL
  family: 4, // fuerza IPv4 (IPv6 puede no estar disponible en la red local)
});

await client.connect();
try {
  for (const file of files) {
    const sql = readFileSync(file, "utf8");
    process.stdout.write(`▶ ${file} … `);
    await client.query(sql);
    console.log("OK");
  }
  console.log("\n✓ SQL aplicado correctamente.");
} catch (err) {
  console.error("\n✗ Error ejecutando SQL:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
