import { ImageResponse } from "next/og";

export const alt = "Breteame — Profesionales verificados en Costa Rica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORIES = ["Fontanería", "Electricidad", "Cerrajería", "Jardinería", "Escombreros"];

// Path del ícono "Wrench" de lucide-react — no se puede importar el componente
// acá porque lucide-react es "use client" y ImageResponse corre fuera del
// árbol de React (lanza en runtime si se intenta).
const WRENCH_PATH =
  "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1C6FD2 0%, #123F73 100%)",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d={WRENCH_PATH} />
            </svg>
          </div>
          <div style={{ color: "#ffffff", fontSize: 72, fontWeight: 700, letterSpacing: -1.5 }}>
            Breteame
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            color: "rgba(255,255,255,0.92)",
            fontSize: 32,
            fontWeight: 400,
          }}
        >
          Profesionales verificados en Costa Rica
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 44 }}>
          {CATEGORIES.map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "12px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                color: "#ffffff",
                fontSize: 22,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
