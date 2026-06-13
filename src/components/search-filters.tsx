"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search, X } from "lucide-react";
import { CATEGORIES, COMING_SOON } from "@/lib/categories";
import { LOCATIONS } from "@/lib/locations";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ALL = "all";

export function SearchFilters({
  category,
  location,
  q,
}: {
  category?: string;
  location?: string;
  q?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(q ?? "");

  function commit(params: URLSearchParams) {
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    commit(params);
  }

  // Debounce del texto de búsqueda hacia la URL.
  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === (searchParams.get("q") ?? "")) return;
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      commit(params);
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const hasFilters = !!category || !!location || !!q;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Buscá por nombre o servicio…"
          className="h-11 bg-background pl-9 pr-9"
        />
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
            aria-label="Limpiar búsqueda"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = category === c.slug;
          const Icon = c.icon;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setParam("category", active ? "" : c.slug)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted",
              )}
            >
              <Icon className="size-4" /> {c.label}
            </button>
          );
        })}
        {COMING_SOON.map((c) => {
          const Icon = c.icon;
          return (
            <span
              key={c.label}
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-sm text-muted-foreground/70"
              title="Próximamente"
            >
              <Icon className="size-4" /> {c.label}
              <span className="ml-1 text-[10px] uppercase tracking-wide">pronto</span>
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={location || ALL}
          onValueChange={(v) => setParam("location", v === ALL ? "" : v)}
        >
          <SelectTrigger className="w-56 bg-background">
            <MapPin className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Todas las zonas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las zonas</SelectItem>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setText("");
              commit(new URLSearchParams());
            }}
          >
            <X className="size-4" /> Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
