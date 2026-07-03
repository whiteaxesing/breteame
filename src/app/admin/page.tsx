import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Handshake,
  HardHat,
  QrCode,
  ShieldAlert,
  Store as StoreIcon,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalAvatar } from "@/components/professional-avatar";
import { CategoryChip, PremiumBadge } from "@/components/badges";
import { VerifyToggle } from "@/components/verify-toggle";
import { InvitarProfesionalForm } from "@/components/invitar-profesional-form";
import { DarAccesoDialog } from "@/components/dar-acceso-dialog";
import { RegenerarAccesoDialog } from "@/components/regenerar-acceso-dialog";
import { CopiarEnlaceQR } from "@/components/copiar-enlace-qr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProfessionalPublic, Store } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?next=/admin");

  if (session.profile?.role !== "admin") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldAlert className="size-8 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Acceso restringido</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Esta sección es solo para administradores.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const [
    { data: prosData },
    { data: storesData },
    { count: usuarios },
    { count: contactos },
  ] = await Promise.all([
    supabase
      .from("professionals_public")
      .select("*")
      .order("is_verified", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("stores").select("*").order("qr_scans", { ascending: false }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
  ]);

  const pros = (prosData ?? []) as ProfessionalPublic[];
  const stores = (storesData ?? []) as Store[];
  const pendientes = pros.filter((p) => !p.is_verified).length;
  const verificados = pros.length - pendientes;
  const ferreteriasAliadas = stores.filter((s) => s.is_partner).length;
  const totalScans = stores.reduce((sum, s) => sum + s.qr_scans, 0);

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de administración</h1>
          <p className="text-sm text-muted-foreground">
            Verificá profesionales y monitoreá las ferreterías aliadas.
          </p>
        </div>

        {/* Métricas globales (para el pitch) */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <TrendingUp className="size-4" /> Métricas de la plataforma
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat
              icon={<Users className="size-4 text-blue-600" />}
              value={usuarios ?? 0}
              label="Usuarios"
            />
            <Stat
              icon={<Handshake className="size-4 text-green-600" />}
              value={contactos ?? 0}
              label="Contactos"
            />
            <Stat
              icon={<HardHat className="size-4 text-violet-600" />}
              value={pros.length}
              label="Profesionales"
              hint={`${verificados} verificados`}
            />
            <Stat
              icon={<StoreIcon className="size-4 text-orange-600" />}
              value={ferreteriasAliadas}
              label="Ferreterías aliadas"
            />
            <Stat
              icon={<QrCode className="size-4 text-primary" />}
              value={totalScans}
              label="Escaneos QR"
            />
          </div>
        </section>

        {/* Invitar profesional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4" /> Invitar profesional
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Genera un link de acceso único para mandarlo por WhatsApp o correo. Expira en 24 horas.
            </p>
          </CardHeader>
          <CardContent>
            <InvitarProfesionalForm />
          </CardContent>
        </Card>

        {/* Profesionales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Profesionales{" "}
              <span className="font-normal text-muted-foreground">
                ({pros.length})
              </span>
            </CardTitle>
            {pendientes > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                {pendientes} sin verificar
              </span>
            )}
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Acceso</TableHead>
                  <TableHead className="text-right">Verificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pros.map((pro) => (
                  <TableRow key={pro.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProfessionalAvatar
                          name={pro.name}
                          imageUrl={pro.image_url}
                          category={pro.category}
                          className="size-8 rounded-full text-xs"
                        />
                        <div>
                          <span className="block font-medium">{pro.name}</span>
                          <Link
                            href={`/admin/pro/${pro.id}/editar`}
                            className="text-xs text-primary underline-offset-2 hover:underline"
                          >
                            Editar
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CategoryChip category={pro.category} />
                    </TableCell>
                    <TableCell>
                      {pro.is_premium ? (
                        <PremiumBadge />
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pro.user_id ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Con acceso
                          </span>
                          <RegenerarAccesoDialog professionalId={pro.id} name={pro.name} />
                        </div>
                      ) : (
                        <DarAccesoDialog professionalId={pro.id} name={pro.name} />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <VerifyToggle
                          professionalId={pro.id}
                          initial={pro.is_verified}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Ferreterías */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <StoreIcon className="size-4" /> Ferreterías aliadas
            </CardTitle>
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <QrCode className="size-3.5" /> {totalScans} escaneos totales
            </span>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ferretería</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enlace QR</TableHead>
                  <TableHead className="text-right">Escaneos QR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {store.address ?? "—"}
                    </TableCell>
                    <TableCell>
                      {store.is_partner ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Aliada
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                          Prospecto
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {store.slug ? (
                        <CopiarEnlaceQR slug={store.slug} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin slug</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {store.qr_scans}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
  hint,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

