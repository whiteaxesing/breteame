"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
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
import { registrarProfesionalPublico } from "@/lib/actions";
import type { CategorySlug } from "@/lib/types";

export function UnirseFform() {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    setError(null);
    startTransition(async () => {
      const res = await registrarProfesionalPublico(name, phone, category as CategorySlug, location, description, honeypot);
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle className="size-14 text-green-500" />
        <h2 className="text-2xl font-bold">¡Ya quedaste registrado!</h2>
        <p className="max-w-sm text-muted-foreground">
          En los próximos días te contactamos al <strong>{phone}</strong> para
          activar tu perfil y empezar a recibir clientes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="middle_name"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      />
      <div className="space-y-1.5">
        <Label htmlFor="u-name" className="text-base">Su nombre completo</Label>
        <Input
          id="u-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="u-phone" className="text-base">
          Su teléfono <span className="text-destructive">*</span>
        </Label>
        <Input
          id="u-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="8888-1234"
          className="h-12 text-base"
          required
        />
        <p className="text-xs text-muted-foreground">
          Por acá lo vamos a contactar para activar su perfil.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-base">¿En qué trabaja?</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as CategorySlug)}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Seleccione su oficio..." />
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
        <Label htmlFor="u-location" className="text-base">
          ¿En qué zona trabaja?
        </Label>
        <Input
          id="u-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: San José, Alajuela, Heredia..."
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="u-desc" className="text-base">
          Cuéntenos un poco de su trabajo{" "}
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="u-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Tengo 20 años de experiencia en fontanería residencial..."
          className="min-h-24 text-base"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={isPending || !category}
        className="h-12 w-full text-base"
      >
        {isPending && <Loader2 className="animate-spin" />}
        Registrarme gratis
      </Button>
    </form>
  );
}
