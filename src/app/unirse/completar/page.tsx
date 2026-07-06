import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CompletarPerfilGoogleForm } from "@/components/completar-perfil-google-form";

export const dynamic = "force-dynamic";

export default async function CompletarPerfilPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/unirse");

  const admin = createAdminClient();
  const { data: existingPro } = await admin
    .from("professionals")
    .select("id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (existingPro) redirect("/dashboard");

  const name = session.profile?.full_name ?? "";

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-lg px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Completá tu perfil</h1>
          <p className="mt-2 text-muted-foreground">
            Ya estás autenticado con Google. Solo falta la info de tu trabajo.
          </p>
        </div>
        <CompletarPerfilGoogleForm name={name} />
      </div>
    </main>
  );
}
