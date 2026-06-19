"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actualizarNombre } from "@/lib/actions";

export function EditarNombreForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await actualizarNombre(name);
      if (res.ok) {
        toast.success("Guardamos tu nombre");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <Label htmlFor="nombre" className="text-base">
        Tu nombre
      </Label>
      <div className="flex gap-2">
        <Input
          id="nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre completo"
          className="h-11 max-w-xs text-base"
          required
        />
        <Button type="submit" disabled={isPending} variant="outline" className="h-11">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Es el nombre que ven los profesionales cuando los contactás.
      </p>
    </form>
  );
}
