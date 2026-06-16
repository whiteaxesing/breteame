import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { origin } = new URL(request.url);
  const admin = createAdminClient();

  const { data: store } = await admin
    .from("stores")
    .select("id, qr_scans")
    .eq("slug", slug)
    .single();

  if (!store) {
    return NextResponse.redirect(origin);
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    undefined;

  await Promise.all([
    admin.from("qr_events").insert({ store_slug: slug, user_agent: userAgent, ip }),
    admin.from("stores").update({ qr_scans: store.qr_scans + 1 }).eq("id", store.id),
  ]).catch(() => null);

  const response = NextResponse.redirect(origin);

  response.cookies.set("qr_source", slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
