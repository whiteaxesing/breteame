import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditarAnuncioAdminForm } from "@/components/editar-anuncio-admin-form";

export const dynamic = "force-dynamic";

export default async function AdminEditarProPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getCurrentUser();
  if (!session) redirect("/login?next=/admin");
  if (session.profile?.role !== "admin") redirect("/admin");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("professionals")
    .select(
      "id, name, category, extra_categories, location, phone, description, is_emergency, is_available_now, emite_factura",
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver al admin
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Editar anuncio</CardTitle>
            <p className="text-sm text-muted-foreground">{data.name}</p>
          </CardHeader>
          <CardContent>
            <EditarAnuncioAdminForm
              pro={{
                id: data.id,
                name: data.name,
                category: data.category as never,
                extra_categories: (data.extra_categories ?? []) as never,
                location: data.location,
                phone: data.phone,
                description: data.description,
                is_emergency: data.is_emergency,
                is_available_now: data.is_available_now,
                emite_factura: data.emite_factura,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
