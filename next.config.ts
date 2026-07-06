import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al dev server desde otros dispositivos de la red local
  // (ej. el celular vía http://192.168.100.57:3000). Solo afecta a desarrollo.
  allowedDevOrigins: ["192.168.100.57"],

  async redirects() {
    return [
      // El dominio técnico de Vercel sirve la misma app; cualquier visita ahí
      // (links viejos, config de Supabase desactualizada) se manda al dominio
      // real conservando la ruta. No afecta a los preview deployments.
      {
        source: "/:path*",
        has: [{ type: "host", value: "breteame-cyan.vercel.app" }],
        destination: "https://breteame.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
