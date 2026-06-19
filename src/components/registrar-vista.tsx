"use client";

import { useEffect, useRef } from "react";
import { registrarVistaPerfil } from "@/lib/actions";

/**
 * Registra una vista del anuncio al montarse en el perfil público.
 * El ref evita el doble disparo del Strict Mode en desarrollo.
 */
export function RegistrarVista({ professionalId }: { professionalId: string }) {
  const yaRegistrado = useRef(false);

  useEffect(() => {
    if (yaRegistrado.current) return;
    yaRegistrado.current = true;
    registrarVistaPerfil(professionalId);
  }, [professionalId]);

  return null;
}
