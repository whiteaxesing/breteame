"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { togglePremium } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PRECIO = "₡5.000";

const BENEFICIOS = [
  "Tu anuncio aparece de primero en la búsqueda",
  "Una estrella dorada que llama la atención",
  "Más personas ven tu trabajo y te contactan",
];

export function PremiumCheckout({
  professionalId,
  initial,
}: {
  professionalId: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function activar() {
    startTransition(async () => {
      const res = await togglePremium(professionalId, true);
      if (res.ok) {
        setOn(true);
        setOpen(false);
        toast.success("¡Listo! Tu anuncio ahora es Premium");
      } else {
        toast.error(res.error);
      }
    });
  }

  function cancelar() {
    startTransition(async () => {
      const res = await togglePremium(professionalId, false);
      if (res.ok) {
        setOn(false);
        toast.success("Tu anuncio volvió a ser normal");
      } else {
        toast.error(res.error);
      }
    });
  }

  // Estado activo: confirmación + opción de dar de baja.
  if (on) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-400/30">
            <Star className="size-5 fill-amber-500 text-amber-500" />
          </span>
          <div className="space-y-1">
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">
              Tu anuncio es Premium
            </h2>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Estás apareciendo de primero en la búsqueda. Así te ven más clientes.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelar}
              disabled={pending}
              className="-ml-2 mt-1 h-8 text-amber-700 hover:text-amber-900 dark:text-amber-400"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Dejar de ser Premium
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Estado inactivo: invitación a hacerse Premium.
  return (
    <>
      <div className="rounded-lg border bg-amber-50/50 p-5 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
            <Star className="size-5 fill-amber-400 text-amber-400" />
          </span>
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="font-semibold">Aparecé de primero con Premium</h2>
              <p className="text-sm text-muted-foreground">
                Los anuncios Premium salen antes que los demás. Más visitas, más clientes.
              </p>
            </div>
            <ul className="space-y-1.5">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  {b}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => setOpen(true)}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <Star className="size-4 fill-current" />
              Activar Premium · {PRECIO} por mes
            </Button>
          </div>
        </div>
      </div>

      <PagoSimuladoDialog
        open={open}
        onOpenChange={setOpen}
        pending={pending}
        onPagar={activar}
      />
    </>
  );
}

function PagoSimuladoDialog({
  open,
  onOpenChange,
  pending,
  onPagar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pending: boolean;
  onPagar: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            Activar Premium
          </DialogTitle>
          <DialogDescription>
            {PRECIO} por mes. Podés cancelar cuando querás.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onPagar();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="pago-tarjeta" className="text-base">
              Número de tarjeta
            </Label>
            <Input
              id="pago-tarjeta"
              defaultValue="4242 4242 4242 4242"
              inputMode="numeric"
              className="h-11 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pago-vence" className="text-base">
                Vence
              </Label>
              <Input id="pago-vence" defaultValue="12/28" className="h-11 text-base" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pago-cvc" className="text-base">
                CVC
              </Label>
              <Input id="pago-cvc" defaultValue="123" className="h-11 text-base" />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <span>
              Esto es una <strong>demostración</strong>: no se cobra nada de verdad. Aquí
              iría el pago seguro con Stripe.
            </span>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full bg-amber-500 text-base text-white hover:bg-amber-600"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Pagar {PRECIO} y activar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
