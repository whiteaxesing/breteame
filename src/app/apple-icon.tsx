import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Path del ícono "Wrench" de lucide-react (node_modules/lucide-react/dist/esm/icons/wrench.mjs).
// No se puede importar el componente acá porque lucide-react es "use client"
// y ImageResponse corre fuera del árbol de React (lanza en runtime si se intenta).
const WRENCH_PATH =
  "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1C6FD2",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d={WRENCH_PATH} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
