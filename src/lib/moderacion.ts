// ============================================================================
// Moderación de imágenes — punto único y enchufable.
//
// HOY: modo MANUAL. moderarImagen() devuelve "pendiente" → toda foto cae a la
// cola de revisión del admin. Cero dependencias, cero costo.
//
// PARA AUTOMATIZAR más adelante: implementá un proveedor en
// `moderarConProveedor()`. Puede ser un servicio self-hosted (tu propio
// endpoint con un modelo NSFW) o uno de terceros (OpenAI, Google Vision,
// Sightengine…). El resto del sistema —subida, publicación, cola del admin— ya
// consume el veredicto, así que no hay que tocar nada más.
// ============================================================================

export type VeredictoFoto = {
  estado: "aprobada" | "pendiente" | "rechazada";
  motivo?: string;
};

export async function moderarImagen(url: string): Promise<VeredictoFoto> {
  const automatico = await moderarConProveedor(url);
  if (automatico) return automatico;
  // Sin proveedor configurado → revisión manual del admin.
  return { estado: "pendiente", motivo: "En revisión." };
}

/**
 * Punto de extensión. Devolvé un veredicto automático, o `null` si no hay
 * proveedor configurado (entonces la foto cae a revisión manual).
 *
 * Ejemplo con un endpoint self-hosted (definí MODERACION_API_URL y descomentá):
 *
 *   const api = process.env.MODERACION_API_URL;
 *   if (api) {
 *     const res = await fetch(api, {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ url }),
 *     });
 *     if (res.ok) {
 *       const { nsfwScore } = await res.json(); // 0–1
 *       if (nsfwScore >= 0.7) return { estado: "rechazada", motivo: "Contenido explícito." };
 *       if (nsfwScore >= 0.3) return { estado: "pendiente", motivo: "Posible contenido sensible." };
 *       return { estado: "aprobada" };
 *     }
 *   }
 */
async function moderarConProveedor(url: string): Promise<VeredictoFoto | null> {
  // Proveedor opcional: OpenAI (gratis, pero requiere cuenta con billing).
  // Si no hay OPENAI_API_KEY o la API falla, devuelve null → cae a manual.
  return moderarConOpenAI(url);
}

async function moderarConOpenAI(url: string): Promise<VeredictoFoto | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input: [{ type: "image_url", image_url: { url } }],
      }),
    });
    if (!res.ok) return null; // proveedor no disponible → manual

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    const cats = result.categories ?? {};
    const scores = result.category_scores ?? {};

    if (cats["sexual/minors"]) {
      return { estado: "rechazada", motivo: "Contenido sexual con menores." };
    }

    const peor = Math.max(
      scores.sexual ?? 0,
      scores["sexual/minors"] ?? 0,
      scores.violence ?? 0,
      scores["violence/graphic"] ?? 0,
      scores.hate ?? 0,
      scores["self-harm"] ?? 0,
    );

    if (peor >= 0.7) return { estado: "rechazada", motivo: "Contenido inapropiado detectado." };
    if (peor >= 0.3) return { estado: "pendiente", motivo: "Posible contenido sensible; revisión manual." };
    return { estado: "aprobada" };
  } catch {
    return null; // error de red → manual
  }
}
