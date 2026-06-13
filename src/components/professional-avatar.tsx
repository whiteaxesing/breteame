import { getCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/lib/types";

/**
 * Avatar de un profesional. Maneja con gracia la ausencia de foto:
 * si no hay image_url muestra la inicial del nombre sobre el color de su
 * categoría (nunca un recuadro roto). El tamaño/redondeo lo da `className`.
 */
export function ProfessionalAvatar({
  name,
  imageUrl,
  category,
  className,
}: {
  name: string;
  imageUrl: string | null;
  category: CategorySlug;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint rule de next/image desactivada a propósito (ver eslint.config.mjs)
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        className={cn("object-cover", className)}
      />
    );
  }

  const cat = getCategory(category);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center font-semibold text-white select-none",
        cat?.solid ?? "bg-zinc-500",
        className,
      )}
    >
      {initial}
    </div>
  );
}
