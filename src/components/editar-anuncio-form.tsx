"use client";

import { useState, useTransition } from "react";
import { Loader2, Zap, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { actualizarAnuncio } from "@/lib/actions";
import type { CategorySlug, ProfessionalWithContact } from "@/lib/types";

export function EditarAnuncioForm({ pro }: { pro: ProfessionalWithContact }) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(pro.name);
  const [category, setCategory] = useState<CategorySlug>(pro.category);
  const [location, setLocation] = useState(pro.location);
  const [phone, setPhone] = useState(pro.phone ?? "");
  const [description, setDescription] = useState(pro.description ?? "");
  const [isEmergency, setIsEmergency] = useState(pro.is_emergency);
  const [isAvailableNow, setIsAvailableNow] = useState(pro.is_available_now);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await actualizarAnuncio({
        name,
        category,
        location,
        phone,
        description,
        isEmergency,
        isAvailableNow,
      });
      if (res.ok) {
        toast.success("Guardamos los cambios de tu anuncio");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="e-name" className="text-base">
          Tu nombre o el de tu negocio
        </Label>
        <Input
          id="e-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-base">¿En qué trabajás?</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as CategorySlug)}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug} className="text-base">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="e-location" className="text-base">
          ¿En qué zona trabajás?
        </Label>
        <Input
          id="e-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: San José, Alajuela, Heredia..."
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="e-phone" className="text-base">
          Tu teléfono <span className="text-destructive">*</span>
        </Label>
        <Input
          id="e-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="8888-1234"
          className="h-12 text-base"
          required
        />
        <p className="text-xs text-muted-foreground">
          Es el número al que te van a llamar o escribir los clientes.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="e-desc" className="text-base">
          Contale a los clientes sobre tu trabajo{" "}
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="e-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Tengo 20 años de experiencia en fontanería residencial..."
          className="min-h-24 text-base"
        />
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <label className="flex items-center justify-between gap-4">
          <span className="flex items-start gap-2">
            <Zap className="mt-0.5 size-5 shrink-0 text-red-600" />
            <span>
              <span className="block text-base font-medium">Atiendo emergencias 24/7</span>
              <span className="block text-sm text-muted-foreground">
                Aparecés cuando alguien busca ayuda a cualquier hora.
              </span>
            </span>
          </span>
          <Switch checked={isEmergency} onCheckedChange={setIsEmergency} />
        </label>

        <label className="flex items-center justify-between gap-4">
          <span className="flex items-start gap-2">
            <Clock className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <span>
              <span className="block text-base font-medium">Disponible ahora mismo</span>
              <span className="block text-sm text-muted-foreground">
                Activalo cuando podés salir a trabajar hoy. Acordate de apagarlo después.
              </span>
            </span>
          </span>
          <Switch checked={isAvailableNow} onCheckedChange={setIsAvailableNow} />
        </label>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full text-base"
      >
        {isPending && <Loader2 className="animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
