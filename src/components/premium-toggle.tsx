"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { togglePremium } from "@/lib/actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function PremiumToggle({
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
      const res = await togglePremium(professionalId, value);
      if (!res.ok) {
        setOn(!value); // revertir si falla
        toast.error(res.error);
      } else {
        toast.success(
          value ? "Visibilidad Premium activada" : "Visibilidad Premium desactivada",
        );
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-amber-50/50 p-4">
      <div className="space-y-0.5">
        <Label className="flex items-center gap-1.5 text-base">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          Visibilidad Premium
        </Label>
        <p className="text-sm text-muted-foreground">
          Aparecés primero en los resultados.{" "}
          <span className="italic">Simulado — aquí iría Stripe.</span>
        </p>
      </div>
      <Switch checked={on} onCheckedChange={onChange} disabled={pending} />
    </div>
  );
}
