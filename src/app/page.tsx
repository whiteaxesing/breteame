import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { SearchX, ShieldCheck, Database, QrCode, Search, MessagesSquare, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCategory, isCategorySlug } from "@/lib/categories";
import { SearchFilters } from "@/components/search-filters";
import { ProfessionalCard } from "@/components/professional-card";
import type { ProfessionalResult } from "@/lib/types";

export const dynamic = "force-dynamic";

const isConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Título y canonical según la categoría filtrada, para que cada
// categoría sea una página indexable propia (ej. "Fontanería en Costa Rica").
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const cat = getCategory(category);
  if (!cat) {
    return { alternates: { canonical: "/" } };
  }
  return {
    title: `${cat.label} en Costa Rica — profesionales verificados`,
    description: `${cat.tagline}. Encontrá profesionales de ${cat.label.toLowerCase()} verificados cerca tuyo y contactalos directo por WhatsApp o llamada.`,
    alternates: { canonical: `/?category=${cat.slug}` },
  };
}

const FAQ = [
  {
    question: "¿Cuánto cuesta usar Breteame?",
    answer:
      "Para los clientes es gratis: buscar, comparar perfiles y contactar profesionales no cuesta nada. Para los profesionales, aparecer en Breteame también es gratis.",
  },
  {
    question: "¿Qué significa el sello Verificado?",
    answer:
      "Que nuestro equipo validó la cédula de identidad del profesional, comprobó referencias de clientes anteriores y verificó sus años de experiencia en el oficio.",
  },
  {
    question: "¿Cómo contacto a un profesional?",
    answer:
      "Creás una cuenta gratis y en el perfil del profesional aparecen los botones de WhatsApp y llamada. Hablás directo con la persona, sin intermediarios ni comisiones.",
  },
  {
    question: "¿En qué zonas de Costa Rica funciona?",
    answer:
      "Empezamos por la Gran Área Metropolitana (San José, Alajuela, Cartago y Heredia), y cada profesional indica la zona donde trabaja. Podés filtrar por tu cantón o buscar cerca de tu ubicación.",
  },
  {
    question: "Soy profesional, ¿cómo aparezco en Breteame?",
    answer:
      "Registrate gratis en la página de Unirse, completá tu perfil con tu oficio, zona y fotos de trabajos, y los clientes te van a poder encontrar y contactar directo.",
  },
] as const;

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Breteame",
      url: "https://breteame.com",
      inLanguage: "es",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://breteame.com/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: "Buscá por oficio o zona",
    description:
      "Filtrá por categoría, cantón o cercanía, y encontrá profesionales disponibles cerca tuyo.",
  },
  {
    icon: Star,
    title: "Compará perfiles reales",
    description:
      "Mirá reseñas de otros clientes, fotos de trabajos recientes y el sello de verificación.",
  },
  {
    icon: MessagesSquare,
    title: "Contactá directo",
    description:
      "Hablás por WhatsApp o llamada con el profesional, sin intermediarios ni comisiones.",
  },
] as const;

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

  // Banner de bienvenida si llegó escaneando un QR de ferretería
  let storeName: string | null = null;
  if (isConfigured) {
    const cookieStore = await cookies();
    const qrSource = cookieStore.get("qr_source")?.value;
    if (qrSource) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("stores")
        .select("name")
        .eq("slug", qrSource)
        .single();
      storeName = data?.name ?? null;
    }
  }

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
      if (isCategorySlug(category)) query = query.or(`category.eq.${category},extra_categories.cs.{${category}}`);
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
      if (isCategorySlug(category)) query = query.or(`category.eq.${category},extra_categories.cs.{${category}}`);
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

  const activeCat = getCategory(category);

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Banner QR: visible solo si llegaron escaneando desde una ferretería */}
      {storeName && (
        <div className="border-b bg-primary/5 px-4 py-2.5">
          <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm text-primary">
            <QrCode className="size-4 shrink-0" />
            <span>
              Llegaste desde <strong>{storeName}</strong> — encontrá acá a los profesionales que necesitás.
            </span>
          </div>
        </div>
      )}

      {/* Hero + buscador */}
      <section className="border-b bg-linear-to-b from-primary/5 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" /> Profesionales verificados
            </span>
            {activeCat ? (
              <>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  <span className="text-primary">{activeCat.label}</span> en Costa Rica
                </h1>
                <p className="mt-3 text-muted-foreground sm:text-lg">
                  {activeCat.tagline}. Profesionales verificados cerca tuyo —
                  contactalos directo por WhatsApp o llamada.
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Contratá profesionales{" "}
                  <span className="text-primary">verificados</span> en Costa Rica
                </h1>
                <p className="mt-3 text-muted-foreground sm:text-lg">
                  Fontaneros, electricistas, cerrajeros, jardineros y escombreros de
                  confianza, cerca tuyo. Contactalos directo por WhatsApp o llamada.
                </p>
              </>
            )}
          </div>

          <div className="mt-5 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
            <Suspense>
              <SearchFilters category={category} location={location} q={q} emergency={emergency} available={available} lat={lat} lng={lng} radio={radio} />
            </Suspense>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            ¿Sos profesional?{" "}
            <Link href="/unirse" className="font-medium text-primary underline-offset-4 hover:underline">
              Aparecé en Breteame gratis
            </Link>
          </p>
        </div>
      </section>

      {/* Resultados */}
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
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

      {/* Cómo funciona */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            ¿Cómo funciona Breteame?
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon: Icon, title, description }, i) => (
              <div key={title} className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border bg-card px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {question}
                  <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pt-3 text-sm text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿Sos profesional y querés más clientes?{" "}
            <Link href="/unirse" className="font-medium text-primary underline-offset-4 hover:underline">
              Unite a Breteame gratis
            </Link>
          </p>
        </div>
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
