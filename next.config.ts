import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al dev server desde otros dispositivos de la red local
  // (ej. el celular vía http://192.168.100.57:3000). Solo afecta a desarrollo.
  allowedDevOrigins: ["192.168.100.57"],
};

export default nextConfig;
