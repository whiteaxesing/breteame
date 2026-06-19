"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { alternarGuardado } from "@/lib/actions";

export function GuardarButton({
  professionalId,
  initialSaved,
  className,
}: {
  professionalId: string;
  initialSaved: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !saved;
    setSaved(next); // optimista
    startTransition(async () => {
      const res = await alternarGuardado(professionalId, next);
      if (!res.ok) {
        setSaved(!next); // revertir si falla
        toast.error(res.error);
      } else {
        toast.success(next ? "Lo guardaste en tu cuenta" : "Lo quitaste de guardados");
      }
    });
  }

  return (
    <Button
      type="button"
      variant={saved ? "default" : "outline"}
      onClick={toggle}
      disabled={pending}
      className={className}
    >
      <Bookmark className={saved ? "size-4 fill-current" : "size-4"} />
      {saved ? "Guardado" : "Guardar"}
    </Button>
  );
}
