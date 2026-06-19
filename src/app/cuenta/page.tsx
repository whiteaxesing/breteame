import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, ShieldAlert, History, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalAvatar } from "@/components/professional-avatar";
import { CategoryChip } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Contact, ProfessionalPublic, Review } from "@/lib/types";

export const dynamic = "force-dynamic";

const isConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const dateFmt = new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" });

export default async function CuentaPage() {
  if (!isConfigured) redirect("/");

  const session = await getCurrentUser();
  if (!session) redirect("/login?next=/cuenta");

  if (session.profile?.role !== "cliente") {
    return (
      <Notice
        title="Esta página es para clientes"
        description="Tu cuenta no es de cliente. Si sos profesional, encontrás todo en tu panel."
      />
    );
  }

  const supabase = await createClient();

  // Historial: contactos de este cliente, agrupados por profesional.
  const { data: contactsData } = await supabase
    .from("contacts")
    .select("*")
    .eq("client_id", session.user.id)
    .order("created_at", { ascending: false });
  const contacts = (contactsData ?? []) as Contact[];

  // Reseñas que dejó este cliente.
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*")
    .eq("client_id", session.user.id)
    .order("created_at", { ascending: false });
  const misReviews = (reviewsData ?? []) as Review[];

  // Un solo fetch de profesionales para historial + reseñas.
  const proIds = [
    ...new Set([
      ...contacts.map((c) => c.professional_id),
      ...misReviews.map((r) => r.professional_id),
    ]),
  ];
  let pros: ProfessionalPublic[] = [];
  if (proIds.length > 0) {
    const { data } = await supabase
      .from("professionals_public")
      .select("*")
      .in("id", proIds);
    pros = (data ?? []) as ProfessionalPublic[];
  }
  const proById = new Map(pros.map((p) => [p.id, p]));

  // Agrupa por profesional conservando el orden (más reciente primero).
  const historial: { pro: ProfessionalPublic; lastDate: string; count: number }[] = [];
  const idx = new Map<string, number>();
  for (const c of contacts) {
    const pro = proById.get(c.professional_id);
    if (!pro) continue; // el profesional pudo haber sido borrado
    const existing = idx.get(c.professional_id);
    if (existing !== undefined) {
      historial[existing].count++;
    } else {
      idx.set(c.professional_id, historial.length);
      historial.push({ pro, lastDate: c.created_at, count: 1 });
    }
  }

  const nombre = session.profile?.full_name?.trim() || "";

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {nombre ? `Hola, ${nombre}` : "Mi cuenta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Acá encontrás los profesionales que contactaste.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <History className="size-4" /> Profesionales que contactaste
          </h2>

          {historial.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 py-14 text-center">
              <Search className="size-8 text-muted-foreground" />
              <p className="font-medium">Todavía no contactaste a nadie</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Cuando llamés o escribás a un profesional, lo vas a ver acá para
                volver a encontrarlo fácil.
              </p>
              <Button asChild size="sm" className="mt-1">
                <Link href="/">Buscar un profesional</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {historial.map(({ pro, lastDate, count }) => (
                <Card
                  key={pro.id}
                  className="flex flex-row items-center gap-3 p-4"
                >
                  <ProfessionalAvatar
                    name={pro.name}
                    imageUrl={pro.image_url}
                    category={pro.category}
                    className="size-12 shrink-0 rounded-full text-lg"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate font-medium">{pro.name}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryChip category={pro.category} />
                      <span className="text-xs text-muted-foreground">
                        Último contacto: {dateFmt.format(new Date(lastDate))}
                        {count > 1 && ` · ${count} veces`}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link href={`/pro/${pro.id}`}>Ver de nuevo</Link>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Star className="size-4" /> Mis reseñas
          </h2>

          {misReviews.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 py-14 text-center">
              <Star className="size-8 text-muted-foreground" />
              <p className="font-medium">Todavía no dejaste ninguna reseña</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Después de contactar a un profesional, podés calificarlo desde su
                perfil para ayudar a otros clientes.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {misReviews.map((r) => {
                const pro = proById.get(r.professional_id);
                return (
                  <Card key={r.id} className="space-y-2 p-4">
                    <div className="flex items-center gap-3">
                      {pro && (
                        <ProfessionalAvatar
                          name={pro.name}
                          imageUrl={pro.image_url}
                          category={pro.category}
                          className="size-10 shrink-0 rounded-full"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {pro?.name ?? "Profesional"}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={
                                i < r.rating
                                  ? "size-3.5 fill-amber-400 text-amber-400"
                                  : "size-3.5 fill-muted text-muted-foreground/30"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {pro && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                        >
                          <Link href={`/pro/${pro.id}`}>Ver perfil</Link>
                        </Button>
                      )}
                    </div>
                    {r.comment && (
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {r.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {dateFmt.format(new Date(r.created_at))}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Notice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" />
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
