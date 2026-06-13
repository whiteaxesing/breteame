import { redirect } from "next/navigation";
import Link from "next/link";
import { QrCode, ShieldAlert, Store as StoreIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalAvatar } from "@/components/professional-avatar";
import { CategoryChip, PremiumBadge } from "@/components/badges";
import { VerifyToggle } from "@/components/verify-toggle";
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
  const [{ data: prosData }, { data: storesData }] = await Promise.all([
    supabase
      .from("professionals_public")
      .select("*")
      .order("is_verified", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("stores").select("*").order("qr_scans", { ascending: false }),
  ]);

  const pros = (prosData ?? []) as ProfessionalPublic[];
  const stores = (storesData ?? []) as Store[];
  const pendientes = pros.filter((p) => !p.is_verified).length;
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
                        <span className="font-medium">{pro.name}</span>
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
