import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
        <Skeleton className="h-8 w-32" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-10" />
            </div>
          ))}
        </div>

        {/* Tabla de profesionales */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <div className="rounded-xl border overflow-hidden">
            <div className="border-b bg-muted/40 px-4 py-3 flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-24" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex gap-4 items-center border-b last:border-0">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <Skeleton className="h-4 w-36 flex-1" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
