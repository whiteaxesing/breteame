"use client";

import { useTransition, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dejarResena } from "@/lib/actions";

export function ReviewForm({ professionalId }: { professionalId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Seleccioná una calificación");
      return;
    }
    startTransition(async () => {
      const res = await dejarResena(professionalId, rating, comment.trim());
      if (res.ok) {
        setSent(true);
        toast.success("¡Gracias por tu reseña!");
      } else {
        toast.error(res.error);
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-center">
        <p className="font-medium text-sm">¡Reseña enviada!</p>
        <p className="mt-1 text-xs text-muted-foreground">Gracias por compartir tu experiencia.</p>
      </div>
    );
  }

  const display = hovered || rating;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="font-semibold text-sm">Dejá tu reseña</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus-visible:outline-none"
              aria-label={`${star} estrellas`}
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  display >= star
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Contá tu experiencia (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <Button
          type="submit"
          disabled={isPending || rating === 0}
          className="w-full"
        >
          {isPending ? "Enviando..." : "Enviar reseña"}
        </Button>
      </form>
    </div>
  );
}
