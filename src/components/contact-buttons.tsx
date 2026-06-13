"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { registrarContacto } from "@/lib/actions";
import { getCategory } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types";

const APP_NAME = "Breteame";

export function ContactButtons({
  professionalId,
  name,
  category,
  phone,
}: {
  professionalId: string;
  name: string;
  category: CategorySlug;
  phone: string;
}) {
  const [copied, setCopied] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const categoryLabel = getCategory(category)?.label ?? "un trabajo";
  const message = `Hola ${name}, te contacto desde ${APP_NAME} por un trabajo de ${categoryLabel}.`;
  const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  // Registra el lead sin bloquear la navegación; avisa si falla.
  function track(channel: "whatsapp" | "llamada" | "copiar") {
    registrarContacto(professionalId, channel).then((res) => {
      if (!res.ok) toast.error(res.error);
    });
  }

  function handleWhatsApp() {
    window.open(waUrl, "_blank", "noopener,noreferrer");
    track("whatsapp");
  }

  function handleCall() {
    track("llamada");
    window.location.href = `tel:${phone}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Número copiado al portapapeles");
      track("copiar");
    } catch {
      toast.error("No se pudo copiar el número");
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/40 px-3 py-2 text-center">
        <p className="text-xs text-muted-foreground">Teléfono</p>
        <p className="text-lg font-semibold tracking-wide">{phone}</p>
      </div>

      <div className="grid gap-2">
        <Button
          onClick={handleWhatsApp}
          className="h-11 bg-[#25D366] text-white hover:bg-[#1da851]"
        >
          <MessageCircle className="size-4" /> Contactar por WhatsApp
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleCall} variant="outline" className="h-11">
            <Phone className="size-4" /> Llamar
          </Button>
          <Button onClick={handleCopy} variant="outline" className="h-11">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar número"}
          </Button>
        </div>
      </div>
    </div>
  );
}
