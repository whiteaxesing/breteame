"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { darAccesoProfesional } from "@/lib/actions";

interface Props {
  professionalId: string;
  name: string;
}

export function DarAccesoDialog({ professionalId, name }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGenerar() {
    setError(null);
    startTransition(async () => {
      const res = await darAccesoProfesional(professionalId, name);
      if (res.ok) {
        setLink(res.link);
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
    const msg = `Hola ${name}, te comparto tu link de acceso a Breteame. Es de un solo uso:\n\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function handleClose() {
    setOpen(false);
    setLink(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent">
        <Share2 className="size-3.5" /> Dar acceso
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            {link
              ? "Mandá el link por donde quieras — WhatsApp, correo, lo que sea."
              : "Generá el link de acceso y mandáselo al profesional."}
          </DialogDescription>
        </DialogHeader>

        {!link ? (
          <div className="space-y-3 pt-2">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleGenerar} disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Generar link
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <Button className="flex-1 gap-2" onClick={handleCopy} variant="outline">
                {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                {copied ? "¡Copiado!" : "Copiar link"}
              </Button>
              <Button className="flex-1 gap-2" onClick={handleWhatsApp}>
                <Share2 className="size-4" /> WhatsApp
              </Button>
            </div>
            <Button variant="ghost" className="w-full text-xs" onClick={handleClose}>
              Listo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
