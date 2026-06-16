"use client";

import { useState } from "react";
import { QrCode, Check } from "lucide-react";

export function CopiarEnlaceQR({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  function copiar() {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    navigator.clipboard.writeText(`${base}/f/${slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      onClick={copiar}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-500" />
          <span className="text-green-600">¡Copiado!</span>
        </>
      ) : (
        <>
          <QrCode className="size-3.5" />
          Copiar enlace
        </>
      )}
    </button>
  );
}
