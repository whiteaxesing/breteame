import {
  Wrench,
  Zap,
  KeyRound,
  Sprout,
  Truck,
  PaintRoller,
  Wind,
  Hammer,
  Sparkles,
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
  /** Fondo sólido para el placeholder de avatar. */
  solid: string;
};

// Las 5 categorías activas del MVP.
export const CATEGORIES: Category[] = [
  {
    slug: "fontaneria",
    label: "Fontanería",
    tagline: "Fugas, destaqueos e instalaciones",
    icon: Wrench,
    chip: "bg-blue-100 text-blue-700",
    solid: "bg-blue-600",
  },
  {
    slug: "electricidad",
    label: "Electricidad",
    tagline: "Cortos, breakers e iluminación",
    icon: Zap,
    chip: "bg-amber-100 text-amber-700",
    solid: "bg-amber-500",
  },
  {
    slug: "cerrajeria",
    label: "Cerrajería",
    tagline: "Aperturas, cilindros y llaves",
    icon: KeyRound,
    chip: "bg-zinc-100 text-zinc-700",
    solid: "bg-zinc-700",
  },
  {
    slug: "jardineria",
    label: "Jardinería",
    tagline: "Poda, zacate y zonas verdes",
    icon: Sprout,
    chip: "bg-green-100 text-green-700",
    solid: "bg-green-600",
  },
  {
    slug: "escombreros",
    label: "Escombreros",
    tagline: "Remoción de escombros y acarreos",
    icon: Truck,
    chip: "bg-orange-100 text-orange-700",
    solid: "bg-orange-600",
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
export const COMING_SOON: { label: string; icon: LucideIcon }[] = [
  { label: "Pintura", icon: PaintRoller },
  { label: "Aires acondicionados", icon: Wind },
  { label: "Carpintería", icon: Hammer },
  { label: "Limpieza profunda", icon: Sparkles },
];
