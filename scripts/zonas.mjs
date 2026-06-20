// ============================================================================
// Breteame · Zonas para pseudo-stores de publicidad de calle.
// Fuente única usada por seed-zonas.mjs (crea las filas en `stores`) y por
// generar-panfletos.mjs (genera los QR). Slug con formato <provincia>-<canton>.
// Mantener alineado con src/lib/locations.ts.
// ============================================================================

export const PROVINCIAS = [
  {
    province: "San José",
    cantones: [
      "San José", "Escazú", "Desamparados", "Aserrí", "Mora", "Goicoechea",
      "Santa Ana", "Alajuelita", "Vásquez de Coronado", "Acosta", "Tibás",
      "Moravia", "Montes de Oca", "Curridabat", "Puriscal",
    ],
  },
  {
    province: "Alajuela",
    cantones: [
      "Alajuela", "San Ramón", "Grecia", "Atenas", "Naranjo", "Palmares",
      "Poás", "Orotina", "San Carlos", "Valverde Vega",
    ],
  },
  {
    province: "Heredia",
    cantones: [
      "Heredia", "Barva", "Santo Domingo", "Santa Bárbara", "San Rafael",
      "San Isidro", "Belén", "Flores", "San Pablo", "Sarapiquí",
    ],
  },
  {
    province: "Cartago",
    cantones: [
      "Cartago", "Paraíso", "La Unión", "Jiménez", "Turrialba", "Alvarado",
      "Oreamuno", "El Guarco",
    ],
  },
];

// "San José" → "san-jose", "Vásquez de Coronado" → "vasquez-de-coronado"
export function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Lista de pseudo-stores por zona, slug <provincia>-<canton>.
export function zonasStores() {
  return PROVINCIAS.flatMap(({ province, cantones }) =>
    cantones.map((canton) => ({
      name: `Zona ${canton}, ${province}`,
      slug: `${slugify(province)}-${slugify(canton)}`,
      address: `${canton}, ${province}`,
    })),
  );
}
