"use client";

import { useState, useTransition } from "react";
import { Loader2, Zap, Clock, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { actualizarAnuncioAdmin } from "@/lib/actions";
import { ExtraCategoriasSelector } from "@/components/extra-categorias-selector";
import type { CategorySlug } from "@/lib/types";

// ProfessionalPublic + phone (leído con admin client en la página)
interface ProConPhone {
  id: string;
  name: string;
  category: CategorySlug;
  extra_categories: CategorySlug[];
  location: string;
  phone: string | null;
  description: string | null;
  is_emergency: boolean;
  is_available_now: boolean;
  emite_factura: boolean;
}

export function EditarAnuncioAdminForm({ pro }: { pro: ProConPhone }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(pro.name);
  const [category, setCategory] = useState<CategorySlug>(pro.category);
  const [extraCategories, setExtraCategories] = useState<CategorySlug[]>(pro.extra_categories ?? []);
  const [location, setLocation] = useState(pro.location);
  const [phone, setPhone] = useState(pro.phone ?? "");
  const [description, setDescription] = useState(pro.description ?? "");
  const [isEmergency, setIsEmergency] = useState(pro.is_emergency);
  const [isAvailableNow, setIsAvailableNow] = useState(pro.is_available_now);
  const [emiteFactura, setEmiteFactura] = useState(pro.emite_factura);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await actualizarAnuncioAdmin(pro.id, {
        name,
        category,
        extraCategories,
        location,
        phone,
        description,
        isEmergency,
        isAvailableNow,
        emiteFactura,
      });
      if (res.ok) {
        toast.success("Anuncio actualizado");
        router.push("/admin");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="a-name" className="text-base">Nombre</Label>
        <Input
          id="a-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-base">Categoría principal</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v as CategorySlug);
            setExtraCategories((prev) => prev.filter((s) => s !== v));
          }}
        >
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

      <ExtraCategoriasSelector
        primaryCategory={category}
        selected={extraCategories}
        onChange={setExtraCategories}
      />

      <div className="space-y-1.5">
        <Label htmlFor="a-location" className="text-base">Zona</Label>
        <Input
          id="a-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="a-phone" className="text-base">Teléfono</Label>
        <Input
          id="a-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="8888-1234"
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="a-desc" className="text-base">
          Descripción{" "}
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="a-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 text-base"
        />
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <label className="flex items-center justify-between gap-4">
          <span className="flex items-start gap-2">
            <Zap className="mt-0.5 size-5 shrink-0 text-red-600" />
            <span className="text-base font-medium">Atiende emergencias 24/7</span>
          </span>
          <Switch checked={isEmergency} onCheckedChange={setIsEmergency} />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="flex items-start gap-2">
            <Clock className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <span className="text-base font-medium">Disponible ahora mismo</span>
          </span>
          <Switch checked={isAvailableNow} onCheckedChange={setIsAvailableNow} />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="flex items-start gap-2">
            <Receipt className="mt-0.5 size-5 shrink-0 text-violet-600" />
            <span className="text-base font-medium">Emite factura electrónica</span>
          </span>
          <Switch checked={emiteFactura} onCheckedChange={setEmiteFactura} />
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/admin")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
