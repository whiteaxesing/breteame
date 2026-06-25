"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { moderarFotoAdmin } from "@/lib/actions-fotos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModerarFoto({ photoId }: { photoId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function moderar(aprobar: boolean) {
    startTransition(async () => {
      const res = await moderarFotoAdmin(photoId, aprobar);
      if (res.ok) {
        toast.success(aprobar ? "Foto aprobada y publicada." : "Foto rechazada.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => moderar(false)}
        className={cn("border-red-200 text-red-700 hover:bg-red-50")}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
        Rechazar
      </Button>
      <Button type="button" size="sm" disabled={pending} onClick={() => moderar(true)}>
        <Check className="size-4" /> Aprobar
      </Button>
    </div>
  );
}
