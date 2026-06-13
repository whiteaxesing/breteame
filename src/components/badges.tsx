import { BadgeCheck, Star } from "lucide-react";
import { getCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/lib/types";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white",
        className,
      )}
    >
      <BadgeCheck className="size-3.5" /> Verificado
    </span>
  );
}

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white",
        className,
      )}
    >
      <Star className="size-3.5 fill-current" /> Destacado
    </span>
  );
}

export function CategoryChip({
  category,
  className,
}: {
  category: CategorySlug;
  className?: string;
}) {
  const cat = getCategory(category);
  if (!cat) return null;
  const Icon = cat.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        cat.chip,
        className,
      )}
    >
      <Icon className="size-3" /> {cat.label}
    </span>
  );
}

export function RatingStars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  if (rating <= 0) {
    return <span className={cn("text-xs text-muted-foreground", className)}>Nuevo</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", className)}>
      <Star className="size-4 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}
