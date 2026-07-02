import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "@/lib/categories";

// Regenerar el sitemap cada hora para recoger perfiles nuevos.
export const revalidate = 3600;

const BASE_URL = "https://breteame.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/unirse`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...CATEGORIES.map((cat) => ({
      url: `${BASE_URL}/?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];

  // Perfiles públicos de profesionales. Cliente anónimo sin cookies:
  // la vista professionals_public no expone el teléfono.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from("professionals_public")
      .select("id, created_at");

    for (const pro of data ?? []) {
      entries.push({
        url: `${BASE_URL}/pro/${pro.id}`,
        lastModified: new Date(pro.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
