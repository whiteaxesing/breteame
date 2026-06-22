import { UnirseTabs } from "@/components/unirse-tabs";

export default function UnirsePage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-lg px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Aparezcá en Breteame
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gratis. Sin complicaciones.
          </p>
        </div>
        <UnirseTabs />
      </div>
    </main>
  );
}
