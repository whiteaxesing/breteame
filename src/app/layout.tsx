import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Breteame — Profesionales verificados en Costa Rica",
  description:
    "Encontrá fontaneros, electricistas, cerrajeros, jardineros y escombreros verificados cerca tuyo. Contactalos directo por WhatsApp o llamada.",
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
    >
      <body className="min-h-full flex flex-col bg-background">
        <SiteHeader />
        <div className="flex-1 flex flex-col">{children}</div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
