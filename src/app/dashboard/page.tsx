import { redirect } from "next/navigation";
import Link from "next/link";
import { Inbox, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { PremiumToggle } from "@/components/premium-toggle";
import { LeadStatusSelect } from "@/components/lead-status-select";
import { ProfessionalAvatar } from "@/components/professional-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Contact, ContactChannel, ProfessionalPublic } from "@/lib/types";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("es-CR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function DashboardPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?next=/dashboard");

  if (session.profile?.role !== "profesional") {
    return (
      <Notice
        icon={<ShieldAlert className="size-8 text-muted-foreground" />}
        title="Panel solo para profesionales"
        description="Tu cuenta no tiene un perfil profesional asociado."
      />
    );
  }

  const supabase = await createClient();

  const { data: pros } = await supabase
    .from("professionals_public")
    .select("*")
    .eq("user_id", session.user.id)
    .limit(1);
  const pro = pros?.[0] as ProfessionalPublic | undefined;

  if (!pro) {
    return (
      <Notice
        icon={<ShieldAlert className="size-8 text-muted-foreground" />}
        title="Todavía no tenés un perfil profesional"
        description="Pedile al admin que vincule tu cuenta con un perfil para empezar a recibir leads."
      />
    );
  }

  const { data: leadsData } = await supabase
    .from("contacts")
    .select("*")
    .eq("professional_id", pro.id)
    .order("created_at", { ascending: false });
  const leads = (leadsData ?? []) as Contact[];

  const nuevos = leads.filter((l) => l.status === "nuevo").length;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-3">
          <ProfessionalAvatar
            name={pro.name}
            imageUrl={pro.image_url}
            category={pro.category}
            className="size-12 rounded-full text-lg"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Hola, {pro.name}</h1>
            <p className="text-sm text-muted-foreground">
              Estos son los clientes que te contactaron.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <Stat label="Leads totales" value={leads.length} />
          <Stat label="Sin atender" value={nuevos} highlight={nuevos > 0} />
        </div>

        <PremiumToggle professionalId={pro.id} initial={pro.is_premium} />

        <Card className="overflow-hidden p-0">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <Inbox className="size-8 text-muted-foreground" />
              <p className="font-medium">Todavía no tenés leads</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Cuando un cliente te contacte desde tu perfil, vas a verlo acá.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-1">
                <Link href={`/pro/${pro.id}`}>Ver mi perfil público</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.client_name ?? "Cliente"}
                    </TableCell>
                    <TableCell>
                      <ChannelBadge channel={lead.channel} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dateFmt.format(new Date(lead.created_at))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <LeadStatusSelect
                          contactId={lead.id}
                          status={lead.status}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-2xl font-bold",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: ContactChannel }) {
  const map: Record<ContactChannel, { label: string; cls: string }> = {
    whatsapp: { label: "WhatsApp", cls: "bg-green-100 text-green-700" },
    llamada: { label: "Llamada", cls: "bg-blue-100 text-blue-700" },
    copiar: { label: "Copió número", cls: "bg-zinc-100 text-zinc-700" },
  };
  const c = map[channel];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        c.cls,
      )}
    >
      {c.label}
    </span>
  );
}

function Notice({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        {icon}
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
