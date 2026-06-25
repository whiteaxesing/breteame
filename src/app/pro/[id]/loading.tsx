import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <Skeleton className="h-4 w-36" />

        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_320px]">
          {/* Columna principal */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Skeleton className="size-24 rounded-xl shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-7 w-48" />
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>

            {/* Trabajos recientes */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-36" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-4/3 w-full rounded-lg" />
                ))}
              </div>
            </div>

            {/* Reseñas */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="rounded-xl border bg-card p-6 space-y-3 md:sticky md:top-20">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
