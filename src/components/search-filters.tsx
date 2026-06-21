"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Locate, MapPin, Search, Shield, X, Zap } from "lucide-react";
import { CATEGORIES, COMING_SOON } from "@/lib/categories";
import { LOCATION_GROUPS } from "@/lib/locations";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  emergency,
  available,
  lat,
  lng,
  radio,
}: {
  category?: string;
  location?: string;
  q?: string;
  emergency?: string;
  available?: string;
  lat?: string;
  lng?: string;
  radio?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(q ?? "");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

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

  function renderCategoryButton(c: (typeof CATEGORIES)[number]) {
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
            ? cn(c.solid, "border-transparent text-white")
            : "border-input bg-background hover:bg-muted",
        )}
      >
        <Icon className={cn("size-4", !active && c.accent)} /> {c.label}
      </button>
    );
  }

  const isEmergency = emergency === "1";
  const isAvailable = available === "1";
  const isNear = !!lat && !!lng;
  const hasFilters = !!category || !!location || !!q || isEmergency || isAvailable || isNear;

  function handleCercaDeMi() {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", String(pos.coords.latitude));
        params.set("lng", String(pos.coords.longitude));
        params.delete("location"); // mutuamente excluyente con cantón
        commit(params);
        setGeoLoading(false);
      },
      () => {
        setGeoError("No se pudo obtener tu ubicación. Verificá los permisos.");
        setGeoLoading(false);
      },
      { timeout: 8000 },
    );
  }

  function clearCercaDeMi() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("lng");
    params.delete("radio");
    commit(params);
  }

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

      <div className="pb-2">
        <div className="flex flex-wrap gap-2 pb-1">
          {CATEGORIES.map(renderCategoryButton)}
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
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <button
          type="button"
          onClick={() => setParam("emergency", isEmergency ? "" : "1")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition",
            isEmergency
              ? "border-red-600 bg-red-600 text-white"
              : "border-input bg-background hover:bg-muted",
          )}
        >
          <Zap className={cn("size-4", isEmergency && "fill-current")} /> Emergencia 24/7
        </button>
        <button
          type="button"
          onClick={() => setParam("available", isAvailable ? "" : "1")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition",
            isAvailable
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-input bg-background hover:bg-muted",
          )}
        >
          <Shield className={cn("size-4", isAvailable && "fill-current")} /> Disponible ahora
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isNear ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              <Locate className="size-4" /> Cerca de mí
            </span>
            <Select
              value={radio ?? "15"}
              onValueChange={(v) => setParam("radio", v)}
            >
              <SelectTrigger className="h-9 w-24 rounded-full bg-background text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 25, 50].map((km) => (
                  <SelectItem key={km} value={String(km)}>
                    {km} km
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={clearCercaDeMi}
              className="flex size-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground transition hover:bg-muted"
              aria-label="Quitar filtro de ubicación"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCercaDeMi}
              disabled={geoLoading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-input bg-background px-3 py-1.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
            >
              <Locate className="size-4" />
              {geoLoading ? "Obteniendo ubicación…" : "Cerca de mí"}
            </button>
            <Select
              value={location || ALL}
              onValueChange={(v) => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("lat");
                params.delete("lng");
                if (v === ALL) params.delete("location");
                else params.set("location", v);
                commit(params);
              }}
            >
              <SelectTrigger className="min-w-0 flex-1 bg-background sm:flex-none sm:w-52">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Todos los cantones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos los cantones</SelectItem>
                {LOCATION_GROUPS.map((group) => (
                  <SelectGroup key={group.province}>
                    <SelectLabel>{group.province}</SelectLabel>
                    {group.cantones.map((canton) => (
                      <SelectItem key={canton} value={canton}>
                        {canton}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setText("");
              commit(new URLSearchParams());
            }}
          >
            <X className="size-4" /> Limpiar filtros
          </Button>
        )}
      </div>

      {geoError && (
        <p className="text-xs text-destructive">{geoError}</p>
      )}
    </div>
  );
}
