import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Breteame",
    short_name: "Breteame",
    description:
      "Encontrá fontaneros, electricistas, cerrajeros, jardineros y más profesionales verificados en Costa Rica.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1C6FD2",
    lang: "es",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
