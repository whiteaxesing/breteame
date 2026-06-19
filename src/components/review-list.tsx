import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-semibold">
        Reseñas{" "}
        <span className="font-normal text-sm text-muted-foreground">
          ({reviews.length})
        </span>
      </h2>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-lg border p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm">{r.reviewer_name}</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-3.5",
                      i < r.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
            </div>
            {r.comment && (
              <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString("es-CR", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
