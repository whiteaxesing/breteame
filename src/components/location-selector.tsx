"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CR_LOCATIONS } from "@/lib/cr-locations";

interface Props {
  /** Ubicación actual del profesional (texto libre). Se muestra si no hay selección nueva. */
  defaultLocation?: string;
  onChange: (location: string, lat: number, lng: number) => void;
}

export function LocationSelector({ defaultLocation, onChange }: Props) {
  const [provincia, setProvincia] = useState("");
  const [canton, setCanton] = useState("");
  const [distrito, setDistrito] = useState("");

  const selectedProvincia = CR_LOCATIONS.find((p) => p.nombre === provincia);
  const selectedCanton = selectedProvincia?.cantones.find((c) => c.nombre === canton);
  const hasDistritos = (selectedCanton?.distritos?.length ?? 0) > 0;

  function handleProvincia(v: string) {
    setProvincia(v);
    setCanton("");
    setDistrito("");
  }

  function handleCanton(v: string) {
    setCanton(v);
    setDistrito("");
    const prov = CR_LOCATIONS.find((p) => p.nombre === provincia);
    const cant = prov?.cantones.find((c) => c.nombre === v);
    if (cant && !cant.distritos?.length) {
      onChange(`${v}, ${provincia}`, cant.lat, cant.lng);
    }
  }

  function handleDistrito(v: string) {
    setDistrito(v);
    const dist = selectedCanton?.distritos?.find((d) => d.nombre === v);
    if (dist) {
      onChange(`${v}, ${canton}, ${provincia}`, dist.lat, dist.lng);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">Provincia</Label>
        <Select value={provincia} onValueChange={handleProvincia}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Seleccioná una provincia" />
          </SelectTrigger>
          <SelectContent>
            {CR_LOCATIONS.map((p) => (
              <SelectItem key={p.nombre} value={p.nombre}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {provincia && (
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">Cantón</Label>
          <Select value={canton} onValueChange={handleCanton}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Seleccioná un cantón" />
            </SelectTrigger>
            <SelectContent>
              {selectedProvincia?.cantones.map((c) => (
                <SelectItem key={c.nombre} value={c.nombre}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {canton && hasDistritos && (
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">
            Distrito / Ciudad{" "}
            <span className="font-normal text-muted-foreground/70">(opcional)</span>
          </Label>
          <Select value={distrito} onValueChange={handleDistrito}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Seleccioná un distrito" />
            </SelectTrigger>
            <SelectContent>
              {selectedCanton?.distritos?.map((d) => (
                <SelectItem key={d.nombre} value={d.nombre}>
                  {d.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {defaultLocation && !canton && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          Zona actual: <span className="font-medium text-foreground">{defaultLocation}</span>
        </p>
      )}
    </div>
  );
}
