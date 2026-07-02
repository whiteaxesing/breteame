import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/cuenta",
        "/login",
        "/auth/",
        "/r/",
        "/f/",
      ],
    },
    sitemap: "https://breteame.com/sitemap.xml",
  };
}
