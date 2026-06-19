import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Lock, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalAvatar } from "@/components/professional-avatar";
import {
  CategoryChip,
  PremiumBadge,
  RatingStars,
  VerifiedBadge,
} from "@/components/badges";
import { ContactButtons } from "@/components/contact-buttons";
import { ReviewList } from "@/components/review-list";
import { ReviewForm } from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProfessionalWithContact, Review } from "@/lib/types";

export const dynamic = "force-dynamic";

const isConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isConfigured) notFound();

  const session = await getCurrentUser();
  const supabase = await createClient();

  // Logueado: vista con teléfono. Anónimo: vista pública (sin teléfono).
  const view = session ? "professionals_with_contact" : "professionals_public";
  const { data, error } = await supabase
    .from(view)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const pro = data as ProfessionalWithContact;

  // Reseñas: visibles para todos.
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*")
    .eq("professional_id", id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []) as Review[];

  // ¿Puede el cliente dejar una reseña?
  let canReview = false;
  if (session?.profile?.role === "cliente") {
    const { count: contactCount } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", id)
      .eq("client_id", session.user.id);

    if ((contactCount ?? 0) > 0) {
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("professional_id", id)
        .eq("client_id", session.user.id)
        .maybeSingle();

      canReview = !existingReview;
    }
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver a la búsqueda
        </Link>

        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_320px]">
          {/* Columna principal */}
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <ProfessionalAvatar
                  name={pro.name}
                  imageUrl={pro.image_url}
                  category={pro.category}
                  className="size-24 shrink-0 rounded-xl text-4xl"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryChip category={pro.category} />
                    {pro.is_verified && <VerifiedBadge />}
                    {pro.is_premium && <PremiumBadge />}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">{pro.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" /> {pro.location}
                    </span>
                    <RatingStars rating={pro.rating} />
                    {reviews.length > 0 && (
                      <span className="text-xs">
                        {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
                      </span>
                    )}
                  </div>
                  {pro.description && (
                    <p className="pt-1 text-sm leading-relaxed text-foreground/90">
                      {pro.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sello Verificado: explicación del proceso */}
            {pro.is_verified && <VerifiedSection />}

            {/* Portafolio: se oculta si no hay fotos */}
            {pro.portfolio_urls.length > 0 && (
              <section>
                <h2 className="mb-3 font-semibold">Trabajos recientes</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {pro.portfolio_urls.map((url, i) => (
                    // eslint rule de next/image desactivada a propósito
                    <img
                      key={url + i}
                      src={url}
                      alt={`Trabajo de ${pro.name} ${i + 1}`}
                      loading="lazy"
                      className="aspect-4/3 w-full rounded-lg border object-cover"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Formulario de reseña (solo si el cliente ya contactó y no ha reseñado) */}
            {canReview && <ReviewForm professionalId={pro.id} />}

            {/* Lista de reseñas */}
            <ReviewList reviews={reviews} />
          </div>

          {/* Sidebar de contacto */}
          <aside>
            <Card className="md:sticky md:top-20">
              <CardContent>
                {session ? (
                  pro.phone ? (
                    <ContactButtons
                      professionalId={pro.id}
                      name={pro.name}
                      category={pro.category}
                      phone={pro.phone}
                    />
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Este profesional todavía no registró un número de contacto.
                    </p>
                  )
                ) : (
                  <LoginCTA proId={pro.id} />
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function VerifiedSection() {
  const items = [
    "Cédula de identidad costarricense validada",
    "Referencias de clientes anteriores comprobadas",
    "Años de experiencia en el oficio verificados",
    "Sin antecedentes laborales negativos",
  ];

  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="flex items-center gap-2 mb-3">
        <BadgeCheck className="size-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <h2 className="font-semibold text-blue-900 dark:text-blue-300">¿Qué verificamos?</h2>
      </div>
      <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
        Antes de otorgar el sello Verificado, nuestro equipo revisó lo siguiente:
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
            <BadgeCheck className="size-4 shrink-0 mt-0.5 text-blue-500" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function LoginCTA({ proId }: { proId: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="size-5" />
      </span>
      <div>
        <p className="font-semibold">Iniciá sesión para contactar</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Mostramos el teléfono y los botones de contacto solo a usuarios
          registrados.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href={`/login?next=/pro/${proId}`}>Iniciá sesión para contactar</Link>
      </Button>
    </div>
  );
}
