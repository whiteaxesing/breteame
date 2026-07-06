"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { createClient } from "@/lib/supabase/client";
import type { CategorySlug } from "@/lib/types";

async function generateNonce(): Promise<[string, string]> {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [raw, hashed];
}

export function UnirseCuentaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.google) initGoogleButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initGoogleButton() {
    if (!window.google || !googleButtonRef.current) return;
    const [nonce, hashedNonce] = await generateNonce();
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      nonce: hashedNonce,
      callback: async (response) => {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
          nonce,
        });
        if (error) {
          setError("No se pudo continuar con Google.");
          return;
        }
        router.push("/unirse/completar");
        router.refresh();
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signup_with",
      shape: "rectangular",
      width: googleButtonRef.current.clientWidth || 480,
    });
  }

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
    <div className="space-y-5">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogleButton}
      />
      <div ref={googleButtonRef} className="flex w-full justify-center" />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">o con correo y contraseña</span>
        <Separator className="flex-1" />
      </div>

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
    </div>
  );
}
