// Cantones del GAM y zonas cercanas, agrupados por provincia.
// Los profesionales guardan su zona como texto libre; el filtro hace
// coincidencia parcial (ilike) contra `location`.

export type LocationGroup = {
  province: string;
  cantones: string[];
};

export const LOCATION_GROUPS: LocationGroup[] = [
  {
    province: "San José",
    cantones: [
      "San José",
      "Escazú",
      "Desamparados",
      "Aserrí",
      "Mora",
      "Goicoechea",
      "Santa Ana",
      "Alajuelita",
      "Vásquez de Coronado",
      "Acosta",
      "Tibás",
      "Moravia",
      "Montes de Oca",
      "Curridabat",
      "Puriscal",
    ],
  },
  {
    province: "Alajuela",
    cantones: [
      "Alajuela",
      "San Ramón",
      "Grecia",
      "Atenas",
      "Naranjo",
      "Palmares",
      "Poás",
      "Orotina",
      "San Carlos",
      "Valverde Vega",
    ],
  },
  {
    province: "Heredia",
    cantones: [
      "Heredia",
      "Barva",
      "Santo Domingo",
      "Santa Bárbara",
      "San Rafael",
      "San Isidro",
      "Belén",
      "Flores",
      "San Pablo",
      "Sarapiquí",
    ],
  },
  {
    province: "Cartago",
    cantones: [
      "Cartago",
      "Paraíso",
      "La Unión",
      "Jiménez",
      "Turrialba",
      "Alvarado",
      "Oreamuno",
      "El Guarco",
    ],
  },
];

// Lista plana para compatibilidad con el filtro ilike existente.
export const LOCATIONS: string[] = LOCATION_GROUPS.flatMap((g) => g.cantones);
