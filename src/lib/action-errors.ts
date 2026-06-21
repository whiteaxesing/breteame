// ============================================================================
// Mapea errores técnicos (Supabase / Postgres) a mensajes amigables en español
// y loguea el detalle en el servidor para depurar, sin filtrar internos al
// usuario. Usado por las Server Actions en lugar de devolver error.message crudo.
// ============================================================================

type Falla = { ok: false; error: string };

// Códigos de Postgres / PostgREST → mensaje para el usuario.
const POR_CODIGO: Record<string, string> = {
  "23505": "Ya existe un registro con esos datos.",
  "23503": "Hay una referencia inválida en los datos.",
  "23514": "Algún dato no cumple el formato requerido.",
  "23502": "Falta completar un dato obligatorio.",
  "42501": "No tenés permisos para realizar esta acción.",
  PGRST116: "No encontramos el registro solicitado.",
  PGRST301: "No tenés permisos para realizar esta acción.",
};

/** Traduce un error a un mensaje amigable, sin exponer detalles técnicos. */
export function mensajeError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (code && POR_CODIGO[code]) return POR_CODIGO[code];
  return "No se pudo completar la acción. Probá de nuevo en un momento.";
}

/**
 * Loguea el error técnico en el servidor y devuelve un resultado de falla con
 * mensaje amigable. `contexto` ayuda a ubicar el origen en los logs.
 */
export function falla(error: unknown, contexto?: string): Falla {
  console.error(`[action${contexto ? `:${contexto}` : ""}]`, error);
  return { ok: false, error: mensajeError(error) };
}
