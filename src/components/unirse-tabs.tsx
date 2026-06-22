"use client";

import { useState } from "react";
import { UserCog, MessageCircleHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnirseCuentaForm } from "@/components/unirse-cuenta-form";
import { UnirseFform } from "@/components/unirse-form";

type Modo = "cuenta" | "asistido";

export function UnirseTabs() {
  const [modo, setModo] = useState<Modo>("cuenta");

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setModo("cuenta")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
            modo === "cuenta" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <UserCog className="size-4" /> Creá tu cuenta
        </button>
        <button
          type="button"
          onClick={() => setModo("asistido")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
            modo === "asistido" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MessageCircleHeart className="size-4" /> Que lo hagamos por vos
        </button>
      </div>

      {modo === "cuenta" ? (
        <UnirseCuentaForm />
      ) : (
        <div className="space-y-4">
          <p className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
            Opción temporal: dejanos tus datos y nosotros activamos tu
            anuncio por vos. Si podés, mejor usá &quot;Creá tu cuenta&quot;
            — vas a poder editar tu anuncio vos mismo.
          </p>
          <UnirseFform />
        </div>
      )}
    </div>
  );
}
