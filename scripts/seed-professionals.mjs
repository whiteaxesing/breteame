// ============================================================================
// Breteame · Inserta/actualiza profesionales de prueba vía REST API (HTTP).
// Uso: node --env-file=.env.local scripts/seed-professionals.mjs
// ============================================================================

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

async function upsert(table, rows) {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
}

// Coordenadas aproximadas para el GAM de Costa Rica.
// El trigger sync_ubicacion() en la DB genera el punto geography automáticamente.
const professionals = [
  // ---- Fontanería ----
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Marvin Jiménez",
    category: "fontaneria", location: "San José, Hatillo",
    description: "Fontanero con 12 años de experiencia. Fugas, destaqueos, instalación de calentadores y tanques. Atención el mismo día.",
    is_verified: true, is_premium: true, is_test: true,
    is_emergency: false, is_available_now: true,
    lat: 9.9131, lng: -84.1133,
    rating: 4.9,
    image_url: "https://picsum.photos/seed/breteame-marvin/400/400",
    portfolio_urls: ["https://picsum.photos/seed/breteame-marvin-1/600/400","https://picsum.photos/seed/breteame-marvin-2/600/400","https://picsum.photos/seed/breteame-marvin-3/600/400"],
    phone: "+50688881111",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Andrea Solís Fontanería",
    category: "fontaneria", location: "Heredia, San Pablo",
    description: "Especialista en fontanería residencial y comercial. Reparación de tuberías, instalación de llaves y calentadores solares.",
    is_verified: true, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: true,
    lat: 9.9901, lng: -84.0918,
    rating: 4.3,
    image_url: "https://picsum.photos/seed/breteame-andrea/400/400",
    portfolio_urls: [],
    phone: "+50688886666",
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Fontanería y Gas CR",
    category: "fontaneria", location: "Escazú, San Rafael",
    description: "Instalación y mantenimiento de gas LP, gas natural y tubería de agua. Certificados por ARESEP. Emergencias 24/7.",
    is_verified: true, is_premium: true, is_test: true,
    is_emergency: true, is_available_now: false,
    lat: 9.9284, lng: -84.1400,
    rating: 4.7,
    image_url: "https://picsum.photos/seed/breteame-gasfontan/400/400",
    portfolio_urls: ["https://picsum.photos/seed/breteame-gasfontan-1/600/400","https://picsum.photos/seed/breteame-gasfontan-2/600/400"],
    phone: "+50688887777",
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    name: "Roberto Ureña Plomería",
    category: "fontaneria", location: "Alajuela, Centro",
    description: "Fontanero con 8 años en el oficio. Destaqueos, fugas ocultas, instalación de inodoros y lavatorios. Precios honestos.",
    is_verified: false, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: false,
    lat: 10.0162, lng: -84.2130,
    rating: 4.1,
    image_url: null, portfolio_urls: [],
    phone: "+50688888888",
  },
  // ---- Electricidad ----
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Carlos Mora",
    category: "electricidad", location: "Heredia, Centro",
    description: "Electricista residencial. Cortocircuitos, breakers, tomas, iluminación LED y revisión de paneles.",
    is_verified: true, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: true,
    lat: 9.9988, lng: -84.1171,
    rating: 4.5,
    image_url: null, portfolio_urls: [],
    phone: "+50688882222",
  },
  {
    id: "99999999-9999-4999-8999-999999999999",
    name: "ElectroHogar CR",
    category: "electricidad", location: "Escazú, Guachipelín",
    description: "Instalaciones eléctricas residenciales y automatización del hogar. Smart home, luces LED, paneles solares.",
    is_verified: true, is_premium: true, is_test: true,
    is_emergency: false, is_available_now: true,
    lat: 9.9350, lng: -84.1558,
    rating: 4.8,
    image_url: "https://picsum.photos/seed/breteame-electrohogar/400/400",
    portfolio_urls: ["https://picsum.photos/seed/breteame-electrohogar-1/600/400","https://picsum.photos/seed/breteame-electrohogar-2/600/400"],
    phone: "+50688889999",
  },
  {
    id: "f0f0f0f0-f0f0-4f0f-8f0f-f0f0f0f0f0f0",
    name: "Mauricio Vindas Eléctrico",
    category: "electricidad", location: "Cartago, Centro",
    description: "Electricista residencial e industrial. Revisión de paneles, interruptores y cableado. Atención en Cartago y La Unión.",
    is_verified: true, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: false,
    lat: 9.8647, lng: -83.9194,
    rating: 4.4,
    image_url: "https://picsum.photos/seed/breteame-mauricio/400/400",
    portfolio_urls: [],
    phone: "+50688880101",
  },
  {
    id: "e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1",
    name: "Instalaciones Eléctricas GAM",
    category: "electricidad", location: "Desamparados, San José",
    description: "Toda clase de instalaciones eléctricas. Cumplimos con el Código Eléctrico Nacional. Presupuesto sin compromiso.",
    is_verified: false, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: false,
    lat: 9.8939, lng: -84.0650,
    rating: 3.9,
    image_url: null, portfolio_urls: [],
    phone: "+50688880202",
  },
  // ---- Cerrajería ----
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Cerrajería Llave Maestra 24/7",
    category: "cerrajeria", location: "Alajuela, Centro",
    description: "Apertura de puertas y vehículos, cambio de cilindros, copias de llaves y cerraduras de seguridad. Servicio 24/7.",
    is_verified: true, is_premium: true, is_test: true,
    is_emergency: true, is_available_now: true,
    lat: 10.0162, lng: -84.2130,
    rating: 4.8,
    image_url: "https://picsum.photos/seed/breteame-llave/400/400",
    portfolio_urls: ["https://picsum.photos/seed/breteame-llave-1/600/400","https://picsum.photos/seed/breteame-llave-2/600/400"],
    phone: "+50688883333",
  },
  {
    id: "e2e2e2e2-e2e2-4e2e-8e2e-e2e2e2e2e2e2",
    name: "KeyMaster Escazú",
    category: "cerrajeria", location: "Escazú, Bello Horizonte",
    description: "Apertura de puertas sin daños, duplicado de llaves inteligentes y cerraduras de alta seguridad para condominios. Emergencias 24/7.",
    is_verified: true, is_premium: false, is_test: true,
    is_emergency: true, is_available_now: true,
    lat: 9.9188, lng: -84.1436,
    rating: 4.5,
    image_url: "https://picsum.photos/seed/breteame-keymaster/400/400",
    portfolio_urls: [],
    phone: "+50688880303",
  },
  {
    id: "e3e3e3e3-e3e3-4e3e-8e3e-e3e3e3e3e3e3",
    name: "Cerrajería Centro SJ",
    category: "cerrajeria", location: "San José, Barrio México",
    description: "Servicio rápido en San José. Apertura de carros, casas y cajas fuertes. Copias y reparaciones al instante.",
    is_verified: false, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: false,
    lat: 9.9464, lng: -84.0910,
    rating: 4.0,
    image_url: null, portfolio_urls: [],
    phone: "+50688880404",
  },
  // ---- Jardinería ----
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Jardines Pura Vida",
    category: "jardineria", location: "Cartago, La Unión",
    description: "Mantenimiento de jardines, poda de árboles, zacate y diseño de zonas verdes para casas y condominios.",
    is_verified: false, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: false,
    lat: 9.8998, lng: -83.9990,
    rating: 4.2,
    image_url: null, portfolio_urls: [],
    phone: "+50688884444",
  },
  {
    id: "e4e4e4e4-e4e4-4e4e-8e4e-e4e4e4e4e4e4",
    name: "Verde Limpio Heredia",
    category: "jardineria", location: "Heredia, Mercedes",
    description: "Mantenimiento semanal y quincenal de jardines. Poda de cercas vivas, siembra y fertilización.",
    is_verified: true, is_premium: true, is_test: true,
    is_emergency: false, is_available_now: true,
    lat: 10.0079, lng: -84.1003,
    rating: 4.6,
    image_url: "https://picsum.photos/seed/breteame-verdelimpio/400/400",
    portfolio_urls: ["https://picsum.photos/seed/breteame-verdelimpio-1/600/400"],
    phone: "+50688880505",
  },
  {
    id: "e5e5e5e5-e5e5-4e5e-8e5e-e5e5e5e5e5e5",
    name: "Don Rodrigo Jardinero",
    category: "jardineria", location: "Tibás, León XIII",
    description: "Jardinero de confianza con 20 años de experiencia. Poda, zacate, limpieza y siembra. Precios por hora o contrato.",
    is_verified: false, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: false,
    lat: 9.9699, lng: -84.0828,
    rating: 4.0,
    image_url: null, portfolio_urls: [],
    phone: "+50688880606",
  },
  {
    id: "e6e6e6e6-e6e6-4e6e-8e6e-e6e6e6e6e6e6",
    name: "Jardines del Valle",
    category: "jardineria", location: "La Unión, Tres Ríos",
    description: "Diseño y mantenimiento de áreas verdes para casas, condominios y empresas. Especializados en jardines tropicales.",
    is_verified: true, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: false,
    lat: 9.8998, lng: -83.9820,
    rating: 4.3,
    image_url: "https://picsum.photos/seed/breteame-vallejardines/400/400",
    portfolio_urls: [],
    phone: "+50688880707",
  },
  // ---- Escombreros ----
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Acarreos y Demoliciones GAM",
    category: "escombreros", location: "San José, Desamparados",
    description: "Remoción de escombros, demolición menor y acarreo de materiales. Vagoneta propia, cotización rápida.",
    is_verified: true, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: true,
    lat: 9.8939, lng: -84.0647,
    rating: 4.6,
    image_url: "https://picsum.photos/seed/breteame-gam/400/400",
    portfolio_urls: [],
    phone: "+50688885555",
  },
  {
    id: "e7e7e7e7-e7e7-4e7e-8e7e-e7e7e7e7e7e7",
    name: "Escombros Express Heredia",
    category: "escombreros", location: "Heredia, Barva",
    description: "Retiro de escombros el mismo día. Vagoneta doble fondo. Servicio en Heredia, Alajuela y norte de San José.",
    is_verified: true, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: true,
    lat: 10.0189, lng: -84.1089,
    rating: 4.4,
    image_url: "https://picsum.photos/seed/breteame-escombrosexp/400/400",
    portfolio_urls: [],
    phone: "+50688880808",
  },
  {
    id: "e8e8e8e8-e8e8-4e8e-8e8e-e8e8e8e8e8e8",
    name: "Remoción Norte GAM",
    category: "escombreros", location: "Alajuela, Guadalupe",
    description: "Demolición de paredes, retiro de muebles viejos y limpieza de lotes. Cotizamos gratis. Zona norte del GAM.",
    is_verified: false, is_premium: false, is_test: true,
    is_emergency: false, is_available_now: false,
    lat: 10.0098, lng: -84.2234,
    rating: 3.8,
    image_url: null, portfolio_urls: [],
    phone: "+50688880909",
  },
];

try {
  await upsert("professionals", professionals);
  console.log(`✓ ${professionals.length} profesionales actualizados con coordenadas.`);
} catch (err) {
  console.error("✗ Error:", err.message);
  process.exit(1);
}
