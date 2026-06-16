"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Share2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { invitarProfesional } from "@/lib/actions";
import type { CategorySlug } from "@/lib/types";

export function InvitarProfesionalForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    setError(null);
    setLink(null);
    startTransition(async () => {
      const res = await invitarProfesional(email, name, category as CategorySlug, phone);
      if (res.ok) {
        setLink(res.link);
        setEmail("");
        setName("");
        setCategory("");
        setPhone("");
      } else {
        setError(res.error);
      }
    });
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    if (!link) return;
    const msg = `Hola ${name || ""},te comparto tu link de acceso a Breteame. Es de un solo uso:\n\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  if (link) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-green-600">Cuenta creada. Mandá el link por donde querás:</p>
        <div className="flex gap-2">
          <Button className="flex-1 gap-2" onClick={handleCopy} variant="outline">
            {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
            {copied ? "¡Copiado!" : "Copiar link"}
          </Button>
          <Button className="flex-1 gap-2" onClick={handleWhatsApp}>
            <Share2 className="size-4" /> WhatsApp
          </Button>
        </div>
        <Button variant="ghost" className="w-full text-xs" onClick={() => setLink(null)}>
          Invitar otro profesional
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="inv-name">Nombre completo</Label>
          <Input
            id="inv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inv-email">Correo electrónico</Label>
          <Input
            id="inv-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inv-phone">Teléfono</Label>
          <Input
            id="inv-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="8888-1234"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as CategorySlug)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending || !category} className="gap-2">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Generar link de acceso
      </Button>
    </form>
  );
}
