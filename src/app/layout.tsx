import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://breteame.com"),
  title: {
    default: "Breteame — Profesionales verificados en Costa Rica",
    template: "%s · Breteame",
  },
  description:
    "Encontrá fontaneros, electricistas, cerrajeros, jardineros y escombreros verificados cerca tuyo. Contactalos directo por WhatsApp o llamada.",
  applicationName: "Breteame",
  category: "services",
  keywords: [
    "fontanero Costa Rica",
    "electricista Costa Rica",
    "cerrajero Costa Rica",
    "jardinero Costa Rica",
    "escombrero Costa Rica",
    "profesionales verificados",
    "servicios para el hogar Costa Rica",
    "brete",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "Breteame",
    title: "Breteame — Profesionales verificados en Costa Rica",
    description:
      "Encontrá fontaneros, electricistas, cerrajeros, jardineros y escombreros verificados cerca tuyo. Contactalos directo por WhatsApp o llamada.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Breteame — Profesionales verificados en Costa Rica",
    description:
      "Encontrá fontaneros, electricistas, cerrajeros, jardineros y escombreros verificados cerca tuyo. Contactalos directo por WhatsApp o llamada.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <ThemeProvider>
          <SiteHeader />
          <div className="flex-1 flex flex-col">{children}</div>
          <SiteFooter />
          <Toaster richColors position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
