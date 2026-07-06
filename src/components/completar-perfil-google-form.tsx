"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { completarRegistroProfesionalGoogle } from "@/lib/actions";
import { ExtraCategoriasSelector } from "@/components/extra-categorias-selector";
import { LocationSelector } from "@/components/location-selector";
import type { CategorySlug } from "@/lib/types";

export function CompletarPerfilGoogleForm({ name: initialName }: { name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [extraCategories, setExtraCategories] = useState<CategorySlug[]>([]);
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    startTransition(async () => {
      const res = await completarRegistroProfesionalGoogle({
        name,
        phone,
        category: category as CategorySlug,
        extraCategories,
        location,
        description,
        lat,
        lng,
      });
      if (res.ok) {
        toast.success("¡Listo! Tu anuncio quedó pendiente de verificación.");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="g-name" className="text-base">Tu nombre o el de tu negocio</Label>
        <Input
          id="g-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="g-phone" className="text-base">
          Tu teléfono <span className="text-destructive">*</span>
        </Label>
        <Input
          id="g-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="8888-1234"
          className="h-12 text-base"
          required
        />
        <p className="text-xs text-muted-foreground">
          Por acá te van a contactar los clientes.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-base">¿En qué trabajás?</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v as CategorySlug);
            setExtraCategories((prev) => prev.filter((s) => s !== v));
          }}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Seleccioná tu oficio..." />
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

      <ExtraCategoriasSelector
        primaryCategory={category}
        selected={extraCategories}
        onChange={setExtraCategories}
      />

      <div className="space-y-2">
        <Label className="text-base">¿En qué zona trabajás?</Label>
        <LocationSelector
          onChange={(loc, newLat, newLng) => {
            setLocation(loc);
            setLat(newLat);
            setLng(newLng);
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="g-desc" className="text-base">
          Contale a los clientes sobre tu trabajo{" "}
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="g-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Tengo 20 años de experiencia en fontanería residencial..."
          className="min-h-24 text-base"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || !category}
        className="h-12 w-full text-base"
      >
        {isPending && <Loader2 className="animate-spin" />}
        Publicar mi anuncio
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Tu anuncio queda pendiente de verificación — un admin lo activa antes
        de que aparezca en las búsquedas.
      </p>
    </form>
  );
}
