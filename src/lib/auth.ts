import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

/**
 * Devuelve el usuario autenticado y su perfil (con el rol de la app), o null.
 * Se usa en Server Components y Server Actions para proteger rutas y decidir
 * qué mostrar (p. ej. revelar el teléfono de un profesional).
 */
export async function getCurrentUser(): Promise<{
  user: { id: string; email?: string };
  profile: Profile | null;
} | null> {
  // Sin Supabase configurado no hay sesión posible; evita crashear el header.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();

  // Una cookie con un refresh token inválido/expirado (proyecto Supabase
  // reseteado, sesión revocada, etc.) hace que getUser() lance en vez de
  // devolver user: null. Lo tratamos como "sin sesión".
  let user;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    return null;
  }

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user: { id: user.id, email: user.email }, profile };
}

export function hasRole(
  profile: Profile | null,
  ...roles: Role[]
): boolean {
  return !!profile && roles.includes(profile.role);
}
