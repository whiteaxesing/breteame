// Prueba rápida de la API de moderación de OpenAI con tu OPENAI_API_KEY.
// Uso: node --env-file=.env.local scripts/probar-moderacion.mjs
const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("✗ No hay OPENAI_API_KEY en .env.local");
  process.exit(1);
}
console.log("Key detectada:", key.slice(0, 7) + "…" + key.slice(-4));

const res = await fetch("https://api.openai.com/v1/moderations", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "omni-moderation-latest",
    input: [{ type: "image_url", image_url: { url: "https://picsum.photos/seed/breteame/400" } }],
  }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`\n✗ La API respondió ${res.status} ${res.statusText}:`);
  console.error(text);
  console.error("\nSi dice 'insufficient_quota', la cuenta no está activada para la API (agregá método de pago).");
  console.error("Si dice 'invalid_api_key', la key está mal o es de otra cosa (no de platform.openai.com).");
  process.exit(1);
}

const data = JSON.parse(text);
const r = data.results?.[0];
console.log("\n✓ ¡La key funciona! La moderación respondió.");
console.log("  flagged:", r?.flagged);
console.log("  scores (top):", Object.entries(r?.category_scores ?? {})
  .sort((a, b) => b[1] - a[1]).slice(0, 3)
  .map(([k, v]) => `${k}=${v.toFixed(3)}`).join(", "));
