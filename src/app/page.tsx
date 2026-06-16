import { Suspense } from "react";
import Link from "next/link";
import { SearchX, ShieldCheck, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isCategorySlug } from "@/lib/categories";
import { SearchFilters } from "@/components/search-filters";
import { ProfessionalCard } from "@/components/professional-card";
import type { ProfessionalResult } from "@/lib/types";

export const dynamic = "force-dynamic";

const isConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    location?: string;
    q?: string;
    emergency?: string;
    available?: string;
    lat?: string;
    lng?: string;
    radio?: string;
  }>;
}) {
  const { category, location, q, emergency, available, lat, lng, radio } = await searchParams;
  const radioKm = Math.min(Math.max(parseFloat(radio ?? "15") || 15, 1), 100);

  let pros: ProfessionalResult[] = [];
  let loadError = false;
  let cercaDe = false;

  if (isConfigured) {
    const supabase = await createClient();
    const _lat = lat ? parseFloat(lat) : NaN;
    const _lng = lng ? parseFloat(lng) : NaN;

    if (!isNaN(_lat) && !isNaN(_lng)) {
      // Búsqueda por proximidad via PostGIS RPC.
      cercaDe = true;
      let query = supabase.rpc("profesionales_cerca", { _lat, _lng, _radio_km: radioKm });
      if (isCategorySlug(category)) query = query.eq("category", category);
      if (emergency === "1") query = query.eq("is_emergency", true);
      if (available === "1") query = query.eq("is_available_now", true);
      const cleanQ = q?.replace(/[,()]/g, " ").trim();
      if (cleanQ) query = query.or(`name.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%`);
      const { data, error } = await query;
      if (error) loadError = true;
      pros = (data ?? []) as ProfessionalResult[];
    } else {
      // Búsqueda estándar por filtros.
      let query = supabase.from("professionals_public").select("*");
      if (isCategorySlug(category)) query = query.eq("category", category);
      if (location) query = query.ilike("location", `%${location}%`);
      if (emergency === "1") query = query.eq("is_emergency", true);
      if (available === "1") query = query.eq("is_available_now", true);
      const cleanQ = q?.replace(/[,()]/g, " ").trim();
      if (cleanQ) query = query.or(`name.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%`);
      query = query
        .order("is_premium", { ascending: false })
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false })
        .order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) loadError = true;
      pros = (data ?? []) as ProfessionalResult[];
    }
  }

  return (
    <main className="flex-1">
      {/* Hero + buscador */}
      <section className="border-b bg-linear-to-b from-primary/5 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" /> Profesionales verificados
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Contratá profesionales{" "}
              <span className="text-primary">verificados</span> en Costa Rica
            </h1>
            <p className="mt-3 text-muted-foreground sm:text-lg">
              Fontaneros, electricistas, cerrajeros, jardineros y escombreros de
              confianza, cerca tuyo. Contactalos directo por WhatsApp o llamada.
            </p>
          </div>

          <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
            <Suspense>
              <SearchFilters category={category} location={location} q={q} emergency={emergency} available={available} lat={lat} lng={lng} radio={radio} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        {!isConfigured ? (
          <SetupNotice />
        ) : loadError ? (
          <StateBox
            icon={<Database className="size-8 text-muted-foreground" />}
            title="No se pudieron cargar los profesionales"
            description="Verificá que corriste la migración (0001_init.sql) y el seed en tu proyecto Supabase."
          />
        ) : pros.length === 0 ? (
          <StateBox
            icon={<SearchX className="size-8 text-muted-foreground" />}
            title="No encontramos profesionales"
            description="Probá quitando algún filtro o cambiando la zona de búsqueda."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {pros.length} profesional{pros.length === 1 ? "" : "es"}
              {cercaDe ? ` a menos de ${radioKm} km` : " disponible" + (pros.length === 1 ? "" : "s")}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pros.map((pro) => (
                <ProfessionalCard key={pro.id} pro={pro} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function StateBox({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      {icon}
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Database className="size-5 text-primary" /> Falta conectar Supabase
      </h2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>
          Copiá <code className="rounded bg-muted px-1">.env.example</code> a{" "}
          <code className="rounded bg-muted px-1">.env.local</code> y completá las
          claves de tu proyecto.
        </li>
        <li>
          Corré <code className="rounded bg-muted px-1">supabase/migrations/0001_init.sql</code>{" "}
          y <code className="rounded bg-muted px-1">supabase/seed.sql</code> en el SQL
          Editor.
        </li>
        <li>
          Reiniciá el dev server. Más detalle en el{" "}
          <Link href="/" className="text-primary underline-offset-4 hover:underline">
            README
          </Link>
          .
        </li>
      </ol>
    </div>
  );
}
