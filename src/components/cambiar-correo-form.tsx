"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cambiarCorreo } from "@/lib/actions";

export function CambiarCorreoForm({ currentEmail }: { currentEmail: string | undefined }) {
  const [newEmail, setNewEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const isPlaceholder = currentEmail?.endsWith("@breteame.internal");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await cambiarCorreo(newEmail);
      if (res.ok) {
        setSent(true);
      } else {
        setError(res.error);
      }
    });
  }

  if (sent) {
    return (
      <p className="text-sm text-green-600">
        Listo. Revisá <strong>{newEmail}</strong> y confirmá el cambio desde ese correo.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {!isPlaceholder && currentEmail && (
        <p className="text-sm text-muted-foreground">
          Correo actual: <span className="font-medium text-foreground">{currentEmail}</span>
        </p>
      )}
      {isPlaceholder && (
        <p className="text-sm text-amber-600">
          Todavía no agregaste tu correo. Agregalo para poder entrar a tu cuenta cuando querás.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="correo@nuevo.com"
          required
          className="max-w-xs"
        />
        <Button type="submit" disabled={isPending} variant="outline">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Cambiar
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
