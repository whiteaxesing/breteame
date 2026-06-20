import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada request y la propaga a las cookies
 * de la respuesta. Se invoca desde el middleware raíz.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Sin configurar Supabase no hay sesión que refrescar.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: no metas lógica entre crear el cliente y getUser().
  // getUser() revalida el token y refresca la cookie si hace falta.
  try {
    await supabase.auth.getUser();
  } catch (error) {
    // Cookie con refresh token que ya no existe en Supabase (proyecto
    // reseteado, sesión revocada, etc.). La borramos para que no siga
    // intentando refrescarla en cada request — se autorepara solo.
    if (isRefreshTokenError(error)) {
      const staleNames = request.cookies
        .getAll()
        .map((c) => c.name)
        .filter((name) => name.startsWith("sb-"));
      staleNames.forEach((name) => request.cookies.delete(name));
      supabaseResponse = NextResponse.next({ request });
      staleNames.forEach((name) => supabaseResponse.cookies.delete(name));
    }
  }

  return supabaseResponse;
}

function isRefreshTokenError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "refresh_token_not_found"
  );
}
