"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { falla } from "@/lib/action-errors";
import { moderarImagen } from "@/lib/moderacion";
import type { FotoTipo } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; error: string };
type SubirResult =
  | { ok: true; estado: "aprobada" | "pendiente" | "rechazada"; motivo?: string }
  | { ok: false; error: string };

const BUCKET = "fotos-profesionales";

type AdminClient = ReturnType<typeof createAdminClient>;

/** Copia una foto aprobada al campo público (image_url o portfolio_urls). */
async function aplicarFotoAprobada(admin: AdminClient, profId: string, tipo: FotoTipo, url: string) {
  if (tipo === "perfil") {
    await admin.from("professionals").update({ image_url: url }).eq("id", profId);
    return;
  }
  const { data } = await admin.from("professionals").select("portfolio_urls").eq("id", profId).single();
  const urls = (data?.portfolio_urls ?? []) as string[];
  if (!urls.includes(url)) {
    await admin.from("professionals").update({ portfolio_urls: [...urls, url] }).eq("id", profId);
  }
}

/** Quita una foto del campo público (al rechazar o eliminar). */
async function quitarFotoDeProfesional(admin: AdminClient, profId: string, tipo: FotoTipo, url: string) {
  if (tipo === "perfil") {
    const { data } = await admin.from("professionals").select("image_url").eq("id", profId).single();
    if (data?.image_url === url) {
      await admin.from("professionals").update({ image_url: null }).eq("id", profId);
    }
    return;
  }
  const { data } = await admin.from("professionals").select("portfolio_urls").eq("id", profId).single();
  const urls = (data?.portfolio_urls ?? []) as string[];
  if (urls.includes(url)) {
    await admin.from("professionals").update({ portfolio_urls: urls.filter((u) => u !== url) }).eq("id", profId);
  }
}

/**
 * El profesional sube una foto (ya subida al Storage por el navegador).
 * Se modera con IA: aprobada → se publica; rechazada → se borra del Storage;
 * dudosa → queda pendiente para revisión del admin.
 */
export async function subirFotoProfesional(input: {
  url: string;
  storagePath: string;
  tipo: FotoTipo;
}): Promise<SubirResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión." };

  const { data: pro } = await supabase
    .from("professionals_public")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pro) return { ok: false, error: "No encontramos tu perfil profesional." };

  // El archivo tiene que estar en la carpeta del propio usuario.
  if (!input.storagePath.startsWith(`${user.id}/`)) {
    return { ok: false, error: "Ruta de archivo inválida." };
  }
  if (input.tipo !== "perfil" && input.tipo !== "portafolio") {
    return { ok: false, error: "Tipo de foto inválido." };
  }

  const admin = createAdminClient();
  const veredicto = await moderarImagen(input.url);

  const { error: insErr } = await admin.from("professional_photos").insert({
    professional_id: pro.id,
    url: input.url,
    storage_path: input.storagePath,
    tipo: input.tipo,
    estado: veredicto.estado,
    motivo: veredicto.motivo ?? null,
  });
  if (insErr) return falla(insErr, "subirFoto");

  if (veredicto.estado === "rechazada") {
    await admin.storage.from(BUCKET).remove([input.storagePath]).catch(() => null);
  } else if (veredicto.estado === "aprobada") {
    await aplicarFotoAprobada(admin, pro.id, input.tipo, input.url);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/pro/${pro.id}`);
  return { ok: true, estado: veredicto.estado, motivo: veredicto.motivo };
}

/** El profesional elimina una foto propia (cualquier estado). */
export async function eliminarFotoProfesional(photoId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión." };

  const { data: pro } = await supabase
    .from("professionals_public")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pro) return { ok: false, error: "No encontramos tu perfil profesional." };

  const admin = createAdminClient();
  const { data: photo } = await admin
    .from("professional_photos")
    .select("*")
    .eq("id", photoId)
    .single();
  if (!photo || photo.professional_id !== pro.id) {
    return { ok: false, error: "Foto no encontrada." };
  }

  await admin.storage.from(BUCKET).remove([photo.storage_path]).catch(() => null);
  await quitarFotoDeProfesional(admin, pro.id, photo.tipo, photo.url);
  await admin.from("professional_photos").delete().eq("id", photoId);

  revalidatePath("/dashboard");
  revalidatePath(`/pro/${pro.id}`);
  return { ok: true };
}

/** Admin: aprueba o rechaza una foto pendiente de la cola de moderación. */
export async function moderarFotoAdmin(photoId: string, aprobar: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { ok: false, error: "Acción reservada para admins." };

  const admin = createAdminClient();
  const { data: photo } = await admin
    .from("professional_photos")
    .select("*")
    .eq("id", photoId)
    .single();
  if (!photo) return { ok: false, error: "Foto no encontrada." };

  if (aprobar) {
    await admin
      .from("professional_photos")
      .update({ estado: "aprobada", motivo: "Aprobada por el admin." })
      .eq("id", photoId);
    await aplicarFotoAprobada(admin, photo.professional_id, photo.tipo, photo.url);
  } else {
    await admin
      .from("professional_photos")
      .update({ estado: "rechazada", motivo: "Rechazada por el admin." })
      .eq("id", photoId);
    await admin.storage.from(BUCKET).remove([photo.storage_path]).catch(() => null);
    await quitarFotoDeProfesional(admin, photo.professional_id, photo.tipo, photo.url);
  }

  revalidatePath("/admin");
  revalidatePath(`/pro/${photo.professional_id}`);
  return { ok: true };
}
