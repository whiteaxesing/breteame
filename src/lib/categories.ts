import {
  Wrench,
  Zap,
  KeyRound,
  Sprout,
  Truck,
  PaintRoller,
  Wind,
  Hammer,
  Armchair,
  Sparkles,
  Waves,
  CloudRain,
  type LucideIcon,
} from "lucide-react";
import type { CategorySlug } from "@/lib/types";

export type Category = {
  slug: CategorySlug;
  label: string;
  /** Frase corta para el hero / subtítulos. */
  tagline: string;
  icon: LucideIcon;
  /** Chip suave (fondo claro + texto). */
  chip: string;
  /** Fondo sólido para el placeholder de avatar y el filtro activo. */
  solid: string;
  /** Color de texto para teñir el ícono del filtro inactivo. */
  accent: string;
};

// Las categorías activas del MVP. Cada una con un color asociado por teoría
// de color (azul = agua, verde = jardín, amarillo = electricidad, etc.).
export const CATEGORIES: Category[] = [
  {
    slug: "fontaneria",
    label: "Fontanería",
    tagline: "Fugas, destaqueos e instalaciones",
    icon: Wrench,
    chip: "bg-blue-100 text-blue-700",
    solid: "bg-blue-600",
    accent: "text-blue-600",
  },
  {
    slug: "electricidad",
    label: "Electricidad",
    tagline: "Cortos, breakers e iluminación",
    icon: Zap,
    chip: "bg-amber-100 text-amber-700",
    solid: "bg-amber-500",
    accent: "text-amber-600",
  },
  {
    slug: "cerrajeria",
    label: "Cerrajería",
    tagline: "Aperturas, cilindros y llaves",
    icon: KeyRound,
    chip: "bg-zinc-100 text-zinc-700",
    solid: "bg-zinc-700",
    accent: "text-zinc-700",
  },
  {
    slug: "jardineria",
    label: "Jardinería",
    tagline: "Poda, zacate y zonas verdes",
    icon: Sprout,
    chip: "bg-green-100 text-green-700",
    solid: "bg-green-600",
    accent: "text-green-600",
  },
  {
    slug: "escombreros",
    label: "Escombreros",
    tagline: "Remoción de escombros y acarreos",
    icon: Truck,
    chip: "bg-orange-100 text-orange-700",
    solid: "bg-orange-600",
    accent: "text-orange-600",
  },
  {
    slug: "pintura",
    label: "Pintura",
    tagline: "Interiores, exteriores y acabados",
    icon: PaintRoller,
    chip: "bg-violet-100 text-violet-700",
    solid: "bg-violet-600",
    accent: "text-violet-600",
  },
  {
    slug: "aires",
    label: "Aires acondicionados",
    tagline: "Instalación, recarga y mantenimiento",
    icon: Wind,
    chip: "bg-sky-100 text-sky-700",
    solid: "bg-sky-600",
    accent: "text-sky-600",
  },
  {
    slug: "carpinteria",
    label: "Carpintería",
    tagline: "Puertas, marcos y estructuras de madera",
    icon: Hammer,
    chip: "bg-stone-100 text-stone-700",
    solid: "bg-stone-600",
    accent: "text-stone-600",
  },
  {
    slug: "ebanisteria",
    label: "Ebanistería",
    tagline: "Muebles a medida y acabados finos",
    icon: Armchair,
    chip: "bg-rose-100 text-rose-700",
    solid: "bg-rose-600",
    accent: "text-rose-600",
  },
  {
    slug: "limpieza",
    label: "Limpieza profunda",
    tagline: "Casas, oficinas y post-obra",
    icon: Sparkles,
    chip: "bg-teal-100 text-teal-700",
    solid: "bg-teal-600",
    accent: "text-teal-600",
  },
  {
    slug: "piscinas",
    label: "Piscinas",
    tagline: "Mantenimiento, limpieza y reparación",
    icon: Waves,
    chip: "bg-cyan-100 text-cyan-700",
    solid: "bg-cyan-600",
    accent: "text-cyan-600",
  },
  {
    slug: "hojalateria",
    label: "Hojalatería",
    tagline: "Canoas, bajantes, lumbreras y techos",
    icon: CloudRain,
    chip: "bg-slate-100 text-slate-700",
    solid: "bg-slate-600",
    accent: "text-slate-600",
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, Category>;

export function getCategory(slug: string | null | undefined): Category | undefined {
  if (!slug) return undefined;
  return CATEGORY_MAP[slug as CategorySlug];
}

export function isCategorySlug(value: string | null | undefined): value is CategorySlug {
  return !!value && value in CATEGORY_MAP;
}

// Categorías que se anuncian como "Próximamente" (no seleccionables).
// Vacío por ahora: las que estaban acá ya pasaron a CATEGORIES.
export const COMING_SOON: { label: string; icon: LucideIcon }[] = [];
