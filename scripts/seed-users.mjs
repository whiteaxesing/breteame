// ============================================================================
// Breteame · Crea las cuentas demo (cliente / profesional / admin)
//
// Requisitos: haber corrido 0001_init.sql y seed.sql en tu proyecto Supabase.
// Uso:
//   node --env-file=.env.local scripts/seed-users.mjs
//
// Lee NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY del entorno.
// La service_role key NUNCA debe usarse en el navegador.
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltan variables de entorno.\n" +
      "Corré:  node --env-file=.env.local scripts/seed-users.mjs\n" +
      "y asegurate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "demo1234";
const DEMO = [
  { email: "cliente@demo.cr", role: "cliente", full_name: "Cliente Demo" },
  { email: "pro@demo.cr", role: "profesional", full_name: "Marvin Jiménez" },
  { email: "admin@demo.cr", role: "admin", full_name: "Admin Demo" },
];

// Profesional seed (fontanero) al que se enlaza la cuenta pro@demo.cr.
const PRO_PROFESSIONAL_ID = "11111111-1111-4111-8111-111111111111";

async function findUserIdByEmail(email) {
  // Paginamos por si hay muchos usuarios.
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return null;
}

for (const u of DEMO) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.full_name },
  });

  if (error) {
    if (error.code === "email_exists" || /already/i.test(error.message ?? "")) {
      u._id = await findUserIdByEmail(u.email);
      console.log(`= ${u.email} ya existía`);
    } else {
      throw error;
    }
  } else {
    u._id = data.user.id;
    console.log(`+ creado ${u.email}`);
  }

  if (!u._id) {
    console.warn(`! no pude resolver el id de ${u.email}, lo salto`);
    continue;
  }

  // El trigger ya creó el profile como 'cliente'; acá fijamos rol y nombre.
  const { error: pErr } = await admin
    .from("profiles")
    .update({ role: u.role, full_name: u.full_name })
    .eq("id", u._id);
  if (pErr) throw pErr;
}

// Enlazar la cuenta del profesional con el fontanero del seed.
const pro = DEMO.find((d) => d.role === "profesional");
if (pro?._id) {
  const { error } = await admin
    .from("professionals")
    .update({ user_id: pro._id })
    .eq("id", PRO_PROFESSIONAL_ID);
  if (error) throw error;
  console.log("Vinculado pro@demo.cr → profesional seed (Marvin Jiménez).");
}

console.log(`\nListo. Cuentas demo (contraseña: ${PASSWORD}):`);
for (const d of DEMO) console.log(`  ${d.role.padEnd(11)} ${d.email}`);
