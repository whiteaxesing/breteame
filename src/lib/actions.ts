"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactChannel, ContactStatus, CategorySlug } from "@/lib/types";
import { isCategorySlug } from "@/lib/categories";
import { falla } from "@/lib/action-errors";

type ActionResult = { ok: true } | { ok: false; error: string };
type ActionResultWithLink = { ok: true; link: string } | { ok: false; error: string };

async function acortarUrl(longUrl: string): Promise<string> {
  const code = Math.random().toString(36).slice(2, 8);
  const admin = createAdminClient();
  await admin.from("short_links").insert({ code, url: longUrl });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  return `${base}/r/${code}`;
}

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

  // No registrar un contacto si el profesional abre su propio anuncio.
  const { data: dueno } = await supabase
    .from("professionals_public")
    .select("user_id")
    .eq("id", professionalId)
    .single();
  if (dueno?.user_id === user.id) return { ok: true };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const clientName = profile?.full_name ?? user.email ?? "Cliente";

  const cookieStore = await cookies();
  const qrSource = cookieStore.get("qr_source")?.value ?? null;

  const { error } = await supabase.from("contacts").insert({
    professional_id: professionalId,
    client_id: user.id,
    client_name: clientName,
    channel,
    qr_source: qrSource,
  });

  if (error) return falla(error);
  return { ok: true };
}

/**
 * Registra una vista del anuncio público (para las métricas del profesional).
 * No cuenta las visitas del propio dueño a su anuncio. Fire-and-forget desde
 * el cliente: no revalida ni devuelve nada.
 */
export async function registrarVistaPerfil(professionalId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No inflar las métricas con las visitas del propio profesional.
  if (user) {
    const { data: pro } = await supabase
      .from("professionals_public")
      .select("user_id")
      .eq("id", professionalId)
      .single();
    if (pro?.user_id === user.id) return;
  }

  await supabase.from("profile_views").insert({
    professional_id: professionalId,
    viewer_id: user?.id ?? null,
  });
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

  if (error) return falla(error);
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

  if (error) return falla(error);
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true };
}

/**
 * Admin: crea cuenta a un profesional nuevo y devuelve el link de acceso.
 * El admin lo manda por WhatsApp/correo como prefiera. Link de un solo uso.
 */
export async function invitarProfesional(
  email: string,
  name: string,
  category: CategorySlug,
  phone: string,
): Promise<ActionResultWithLink> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { ok: false, error: "Acción reservada para admins." };

  const admin = createAdminClient();

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
  });
  if (linkError) return falla(linkError, "generateLink");

  const userId = linkData.user.id;
  const link = linkData.properties.action_link;

  await admin
    .from("profiles")
    .upsert({ id: userId, role: "profesional", full_name: name });

  const { error: proError } = await admin.from("professionals").insert({
    user_id: userId,
    name,
    category,
    phone,
    location: "",
  });

  if (proError) return falla(proError);

  revalidatePath("/admin");
  return { ok: true, link: await acortarUrl(link) };
}

/**
 * Admin: da acceso a un profesional ya existente en la BD (sin user_id).
 * Genera el link de acceso para mandarlo por WhatsApp o donde sea. Link de un solo uso.
 */
/**
 * Admin: da acceso a un profesional ya existente en la BD (sin user_id).
 * Genera un correo interno de placeholder para no pedirle nada al admin.
 * El profesional puede actualizar su correo desde su panel.
 */
export async function darAccesoProfesional(
  professionalId: string,
  name: string,
): Promise<ActionResultWithLink> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { ok: false, error: "Acción reservada para admins." };

  const admin = createAdminClient();

  const placeholderEmail = `pro-${professionalId}@breteame.internal`;

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: placeholderEmail,
  });
  if (linkError) return falla(linkError, "generateLink");

  const userId = linkData.user.id;
  const link = linkData.properties.action_link;

  await admin
    .from("profiles")
    .upsert({ id: userId, role: "profesional", full_name: name });

  const { error: proError } = await admin
    .from("professionals")
    .update({ user_id: userId })
    .eq("id", professionalId);

  if (proError) return falla(proError);

  revalidatePath("/admin");
  return { ok: true, link: await acortarUrl(link) };
}

/** Admin: regenera un link de acceso para un profesional que ya tiene cuenta. */
export async function regenerarAcceso(professionalId: string): Promise<ActionResultWithLink> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { ok: false, error: "Acción reservada para admins." };

  const admin = createAdminClient();
  const placeholderEmail = `pro-${professionalId}@breteame.internal`;

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: placeholderEmail,
  });
  if (linkError) return falla(linkError, "generateLink");

  return { ok: true, link: await acortarUrl(linkData.properties.action_link) };
}

/**
 * Página pública /unirse: registra un profesional sin cuenta.
 * Usa el cliente admin para saltarse RLS (user_id queda null hasta que el admin le dé acceso).
 */
export async function registrarProfesionalPublico(
  name: string,
  phone: string,
  category: CategorySlug,
  location: string,
  description: string,
  honeypot: string,
): Promise<ActionResult> {
  // Honeypot: si viene con datos es un bot
  if (honeypot) return { ok: true };

  if (!name.trim() || !phone.trim()) {
    return { ok: false, error: "Nombre y teléfono son obligatorios." };
  }

  const admin = createAdminClient();

  // Rate limit: máximo 10 registros por minuto en toda la plataforma
  const hace1min = new Date(Date.now() - 60_000).toISOString();
  const { count } = await admin
    .from("professionals")
    .select("id", { count: "exact", head: true })
    .is("user_id", null)
    .gte("created_at", hace1min);

  if ((count ?? 0) >= 10) {
    return { ok: false, error: "Demasiados registros en este momento. Intentá de nuevo en unos minutos." };
  }

  // Teléfono único: evita duplicados del mismo profesional
  const { data: existing } = await admin
    .from("professionals")
    .select("id")
    .eq("phone", phone.trim())
    .limit(1)
    .single();

  if (existing) {
    return { ok: false, error: "Ese número de teléfono ya está registrado." };
  }

  const { error } = await admin.from("professionals").insert({
    name: name.trim(),
    phone: phone.trim(),
    category,
    location: location.trim(),
    description: description.trim() || null,
  });

  if (error) return falla(error);
  return { ok: true };
}

/**
 * Dashboard del profesional: actualiza los datos de su anuncio público.
 * No recibe el id del cliente: actualiza la fila cuyo user_id es el del usuario
 * autenticado (RLS professionals_update_own lo garantiza), así nadie puede
 * editar el anuncio de otro pasando un id ajeno.
 * No toca is_verified (lo bloquea el trigger) ni is_premium (tiene su toggle).
 * Las fotos (image_url / portfolio_urls) se manejan aparte con Storage.
 */
export async function actualizarAnuncio(input: {
  name: string;
  category: CategorySlug;
  location: string;
  phone: string;
  description: string;
  isEmergency: boolean;
  isAvailableNow: boolean;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión." };

  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name) return { ok: false, error: "El nombre no puede quedar vacío." };
  if (!phone) return { ok: false, error: "El teléfono no puede quedar vacío." };
  if (!isCategorySlug(input.category)) {
    return { ok: false, error: "Seleccioná un oficio válido." };
  }

  const { error } = await supabase
    .from("professionals")
    .update({
      name,
      category: input.category,
      location: input.location.trim(),
      phone,
      description: input.description.trim() || null,
      is_emergency: input.isEmergency,
      is_available_now: input.isAvailableNow,
    })
    .eq("user_id", user.id);

  if (error) return falla(error);

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true };
}

/**
 * Cuenta del cliente: guarda o quita un profesional de sus favoritos.
 * RLS limita las filas al propio cliente (client_id = auth.uid()).
 */
export async function alternarGuardado(
  professionalId: string,
  guardar: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Tenés que iniciar sesión para guardar profesionales." };
  }

  if (guardar) {
    const { error } = await supabase
      .from("saved_professionals")
      .insert({ client_id: user.id, professional_id: professionalId });
    // 23505 = ya estaba guardado; lo tratamos como éxito (idempotente).
    if (error && error.code !== "23505") return falla(error);
  } else {
    const { error } = await supabase
      .from("saved_professionals")
      .delete()
      .eq("client_id", user.id)
      .eq("professional_id", professionalId);
    if (error) return falla(error);
  }

  revalidatePath("/cuenta");
  revalidatePath(`/pro/${professionalId}`);
  return { ok: true };
}

/** Cuenta del cliente: actualiza su nombre. RLS limita al propio perfil. */
export async function actualizarNombre(fullName: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión." };

  const nombre = fullName.trim();
  if (!nombre) return { ok: false, error: "El nombre no puede quedar vacío." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: nombre })
    .eq("id", user.id);

  if (error) return falla(error);

  revalidatePath("/cuenta");
  return { ok: true };
}

/** Dashboard del profesional: solicita cambio de correo. Supabase manda confirmación al nuevo correo. */
export async function cambiarCorreo(newEmail: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) return falla(error);
  return { ok: true };
}

/**
 * Perfil público: el cliente deja una reseña al profesional que contactó.
 * RLS verifica que exista un contact previo; aquí validamos también para dar
 * mensaje de error claro antes de llegar a la BD.
 */
export async function dejarResena(
  professionalId: string,
  rating: number,
  comment: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tenés que iniciar sesión para dejar una reseña." };

  const { count } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", professionalId)
    .eq("client_id", user.id);

  if ((count ?? 0) === 0) {
    return { ok: false, error: "Solo podés reseñar profesionales que hayas contactado." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const reviewerName = profile?.full_name ?? user.email ?? "Cliente";

  const { error } = await supabase.from("reviews").insert({
    professional_id: professionalId,
    client_id: user.id,
    reviewer_name: reviewerName,
    rating,
    comment: comment || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ya dejaste una reseña para este profesional." };
    }
    return falla(error);
  }

  revalidatePath(`/pro/${professionalId}`);
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

  if (error) return falla(error);
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}
