import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const { origin } = new URL(request.url);

  const admin = createAdminClient();
  const { data } = await admin
    .from("short_links")
    .select("url, expires_at")
    .eq("code", code)
    .single();

  if (!data || new Date(data.expires_at) < new Date()) {
    return NextResponse.redirect(`${origin}/login?error=link-expirado`);
  }

  await admin.from("short_links").delete().eq("code", code);

  return NextResponse.redirect(data.url);
}
