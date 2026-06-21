// ============================================================================
// Validaciones de entrada compartidas. Se usan en las Server Actions (fuente de
// verdad: nunca confiar en el cliente) y también en los forms para feedback
// inmediato. Mantener los límites en sync con los `maxLength` de los inputs.
// ============================================================================

/** Topes de longitud por campo (las columnas son `text`, esto es a nivel app). */
export const LIMITES = {
  nombre: 80,
  telefono: 20,
  ubicacion: 120,
  descripcion: 600,
  comentario: 500,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esEmailValido(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Deja solo dígitos, conservando un `+` inicial. */
export function normalizarTelefono(phone: string): string {
  return phone.trim().replace(/(?!^\+)\D/g, "");
}

/** Teléfono de Costa Rica: 8 dígitos, con prefijo +506 opcional. */
export function esTelefonoCRValido(phone: string): boolean {
  const sinPrefijo = normalizarTelefono(phone).replace(/^\+?506/, "");
  return /^[2-8]\d{7}$/.test(sinPrefijo);
}

/** true si el texto (sin espacios al borde) supera el máximo permitido. */
export function excedeLimite(valor: string, max: number): boolean {
  return valor.trim().length > max;
}

/** Calificación válida: entero de 1 a 5. */
export function esRatingValido(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}
