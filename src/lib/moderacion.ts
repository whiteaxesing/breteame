// ============================================================================
// Moderación de imágenes con la API de OpenAI (omni-moderation-latest, gratis).
// Sin SDK: fetch crudo. Si no hay OPENAI_API_KEY o la API falla, degrada a
// "pendiente" → la foto cae en la cola de revisión manual del admin.
// ============================================================================

export type VeredictoFoto = {
  estado: "aprobada" | "pendiente" | "rechazada";
  motivo?: string;
};

// Umbrales sobre el score (0–1) de las categorías sensibles.
const RECHAZO = 0.7; // por encima → se rechaza solo
const DUDA = 0.3; // entre DUDA y RECHAZO → revisión manual

export async function moderarImagen(url: string): Promise<VeredictoFoto> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { estado: "pendiente", motivo: "Moderación automática no configurada; revisión manual." };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input: [{ type: "image_url", image_url: { url } }],
      }),
    });

    if (!res.ok) {
      return { estado: "pendiente", motivo: `Moderación no disponible (${res.status}); revisión manual.` };
    }

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return { estado: "pendiente", motivo: "Sin resultado de moderación; revisión manual." };

    const cats = result.categories ?? {};
    const scores = result.category_scores ?? {};

    // Tolerancia cero con contenido sexual de menores.
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

    if (peor >= RECHAZO) return { estado: "rechazada", motivo: "Contenido inapropiado detectado." };
    if (peor >= DUDA) return { estado: "pendiente", motivo: "Posible contenido sensible; revisión manual." };
    return { estado: "aprobada" };
  } catch {
    return { estado: "pendiente", motivo: "Error al moderar; revisión manual." };
  }
}
