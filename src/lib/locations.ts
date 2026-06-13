// Zonas dentro de la Gran Área Metropolitana (GAM) para el filtro de ubicación.
// Es una lista curada para el MVP; los profesionales guardan su zona como texto
// libre, así que el filtro hace coincidencia parcial (ilike) contra `location`.
export const LOCATIONS: string[] = [
  "San José",
  "Heredia",
  "Alajuela",
  "Cartago",
  "Escazú",
  "Desamparados",
  "Curridabat",
  "La Unión",
  "Tibás",
  "Goicoechea",
];
