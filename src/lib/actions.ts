"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContactChannel, ContactStatus } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Registra un lead cuando un cliente logueado hace click en contactar.
 * Captura el nombre del cliente (denormalizado) para el panel del profesional.
 */
export async function registrarContacto(
  professionalId: string,
  channel: ContactChannel,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Tenés que iniciar sesión para contactar." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const clientName = profile?.full_name ?? user.email ?? "Cliente";

  const { error } = await supabase.from("contacts").insert({
    professional_id: professionalId,
    client_id: user.id,
    client_name: clientName,
    channel,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Panel del profesional: cambia el estado de un lead. RLS limita al dueño. */
export async function setLeadStatus(
  contactId: string,
  status: ContactStatus,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", contactId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Panel del profesional: activa/desactiva visibilidad Premium (simulado). */
export async function togglePremium(
  professionalId: string,
  value: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("professionals")
    .update({ is_premium: value })
    .eq("id", professionalId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true };
}

/** Panel de admin: verifica/desverifica un profesional. RLS+trigger exigen admin. */
export async function toggleVerified(
  professionalId: string,
  value: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("professionals")
    .update({ is_verified: value })
    .eq("id", professionalId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}
