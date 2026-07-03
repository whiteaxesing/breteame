"use client";

import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/lib/types";

interface Props {
  primaryCategory: CategorySlug | "";
  selected: CategorySlug[];
  onChange: (slugs: CategorySlug[]) => void;
}

export function ExtraCategoriasSelector({ primaryCategory, selected, onChange }: Props) {
  const options = CATEGORIES.filter((c) => c.slug !== primaryCategory);
  if (!primaryCategory) return null;

  function toggle(slug: CategorySlug) {
    onChange(
      selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug],
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        ¿También trabajás en otros oficios?{" "}
        <span className="font-normal text-muted-foreground">(opcional)</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((cat) => {
          const Icon = cat.icon;
          const isChecked = selected.includes(cat.slug);
          return (
            <label
              key={cat.slug}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                isChecked
                  ? "border-primary bg-primary/5 text-primary"
                  : "text-foreground hover:border-primary/40",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isChecked}
                onChange={() => toggle(cat.slug)}
              />
              <Icon className={cn("size-4 shrink-0", isChecked ? "text-primary" : cat.accent)} />
              {cat.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
