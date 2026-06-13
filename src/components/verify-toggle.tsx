"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleVerified } from "@/lib/actions";
import { Switch } from "@/components/ui/switch";

export function VerifyToggle({
  professionalId,
  initial,
}: {
  professionalId: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onChange(value: boolean) {
    setOn(value);
    startTransition(async () => {
      const res = await toggleVerified(professionalId, value);
      if (!res.ok) {
        setOn(!value); // revertir si falla
        toast.error(res.error);
      } else {
        toast.success(value ? "Profesional verificado" : "Verificación retirada");
      }
    });
  }

  return (
    <Switch
      checked={on}
      onCheckedChange={onChange}
      disabled={pending}
      aria-label="Verificar profesional"
    />
  );
}
