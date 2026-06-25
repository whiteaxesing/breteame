import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
        {/* Header con avatar */}
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>

        {/* Stats del mes */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-44" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Card del anuncio */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-40 rounded-lg" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Tabla de leads */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <div className="rounded-xl border overflow-hidden">
            <div className="border-b bg-muted/40 px-4 py-3 grid grid-cols-4 gap-4">
              {["Cliente", "Cómo contactó", "Fecha", "Estado"].map((h) => (
                <Skeleton key={h} className="h-3 w-16" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3 grid grid-cols-4 gap-4 border-b last:border-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-24 rounded-md ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
