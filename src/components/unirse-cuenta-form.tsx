"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { registrarProfesionalConCuenta } from "@/lib/actions";
import { ExtraCategoriasSelector } from "@/components/extra-categorias-selector";
import { LocationSelector } from "@/components/location-selector";
import type { CategorySlug } from "@/lib/types";

export function UnirseCuentaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [extraCategories, setExtraCategories] = useState<CategorySlug[]>([]);
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    setError(null);
    setLoading(true);

    const res = await registrarProfesionalConCuenta({
      name,
      email,
      password,
      phone,
      category: category as CategorySlug,
      extraCategories,
      location,
      description,
      honeypot,
      lat,
      lng,
    });

    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
        <Label htmlFor="uc-name" className="text-base">Su nombre completo</Label>
        <Input
          id="uc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="uc-email" className="text-base">Su correo</Label>
        <Input
          id="uc-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vos@correo.com"
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="uc-password" className="text-base">Cree una contraseña</Label>
        <Input
          id="uc-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          minLength={6}
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="uc-phone" className="text-base">
          Su teléfono <span className="text-destructive">*</span>
        </Label>
        <Input
          id="uc-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="8888-1234"
          className="h-12 text-base"
          required
        />
        <p className="text-xs text-muted-foreground">
          Por acá lo van a contactar los clientes.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-base">¿En qué trabaja?</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v as CategorySlug);
            setExtraCategories((prev) => prev.filter((s) => s !== v));
          }}
        >
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

      <ExtraCategoriasSelector
        primaryCategory={category}
        selected={extraCategories}
        onChange={setExtraCategories}
      />

      <div className="space-y-2">
        <Label className="text-base">¿En qué zona trabaja?</Label>
        <LocationSelector
          onChange={(loc, newLat, newLng) => {
            setLocation(loc);
            setLat(newLat);
            setLng(newLng);
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="uc-desc" className="text-base">
          Cuéntenos un poco de su trabajo{" "}
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="uc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Tengo 20 años de experiencia en fontanería residencial..."
          className="min-h-24 text-base"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={loading || !category}
        className="h-12 w-full text-base"
      >
        {loading && <Loader2 className="animate-spin" />}
        Crear mi cuenta gratis
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Tu anuncio queda pendiente de verificación — un admin lo activa antes
        de que aparezca en las búsquedas.
      </p>
    </form>
  );
}
