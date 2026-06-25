"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { subirFotoProfesional, eliminarFotoProfesional } from "@/lib/actions-fotos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FotoEstado, FotoTipo, ProfessionalPhoto } from "@/lib/types";

const BUCKET = "fotos-profesionales";
const MAX_MB = 5;

export function GestorFotos({
  userId,
  photos,
}: {
  userId: string;
  photos: ProfessionalPhoto[];
}) {
  const router = useRouter();
  const [subiendo, setSubiendo] = useState<FotoTipo | null>(null);
  const [pending, startTransition] = useTransition();
  const perfilRef = useRef<HTMLInputElement>(null);
  const portafolioRef = useRef<HTMLInputElement>(null);

  const perfil = photos.filter((p) => p.tipo === "perfil");
  const portafolio = photos.filter((p) => p.tipo === "portafolio");
  const perfilActual = perfil.find((p) => p.estado === "aprobada");
  const perfilPendiente = perfil.find((p) => p.estado === "pendiente");
  const perfilMostrar = perfilActual ?? perfilPendiente;

  async function subir(file: File | undefined, tipo: FotoTipo) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Subí una imagen (JPG, PNG…).");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`La imagen no puede pasar de ${MAX_MB} MB.`);
      return;
    }
    setSubiendo(tipo);
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        toast.error("No se pudo subir la imagen. Probá de nuevo.");
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const res = await subirFotoProfesional({ url: publicUrl, storagePath: path, tipo });
      if (!res.ok) {
        toast.error(res.error);
      } else if (res.estado === "aprobada") {
        toast.success("¡Foto publicada!");
      } else if (res.estado === "pendiente") {
        toast.message("Foto en revisión", {
          description: "Un administrador la aprobará en breve.",
        });
      } else {
        toast.error("Foto rechazada", { description: res.motivo });
      }
      router.refresh();
    } finally {
      setSubiendo(null);
    }
  }

  function borrar(id: string) {
    startTransition(async () => {
      const res = await eliminarFotoProfesional(id);
      if (res.ok) {
        toast.success("Foto eliminada.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Foto de perfil */}
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border bg-muted">
          {perfilMostrar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={perfilMostrar.url} alt="Foto de perfil" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Camera className="size-7" />
            </div>
          )}
          {perfilMostrar && perfilMostrar.estado !== "aprobada" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <Clock className="size-6 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Foto de perfil</p>
          <p className="text-xs text-muted-foreground">
            Tu cara o el logo de tu negocio. Mejora mucho la confianza del cliente.
          </p>
          {perfilPendiente && !perfilActual && (
            <EstadoTag estado="pendiente" className="mt-1" />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={subiendo === "perfil"}
            onClick={() => perfilRef.current?.click()}
          >
            {subiendo === "perfil" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
            {perfilMostrar ? "Cambiar foto" : "Subir foto"}
          </Button>
          <input
            ref={perfilRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              subir(e.target.files?.[0], "perfil");
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Portafolio */}
      <div>
        <p className="text-sm font-medium">Trabajos (portafolio)</p>
        <p className="text-xs text-muted-foreground">
          Mostrá fotos de tus trabajos. Cada una se revisa antes de publicarse.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {portafolio.map((foto) => (
            <div
              key={foto.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt="Trabajo"
                className={cn(
                  "size-full object-cover",
                  foto.estado !== "aprobada" && "opacity-60",
                )}
              />
              {foto.estado !== "aprobada" && (
                <div className="absolute left-1 top-1">
                  <EstadoTag estado={foto.estado} />
                </div>
              )}
              <button
                type="button"
                onClick={() => borrar(foto.id)}
                disabled={pending}
                aria-label="Eliminar foto"
                className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={subiendo === "portafolio"}
            onClick={() => portafolioRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition hover:bg-muted disabled:opacity-60"
          >
            {subiendo === "portafolio" ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Plus className="size-5" />
            )}
            <span className="text-xs">Agregar</span>
          </button>
          <input
            ref={portafolioRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              subir(e.target.files?.[0], "portafolio");
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EstadoTag({ estado, className }: { estado: FotoEstado; className?: string }) {
  if (estado === "aprobada") return null;
  const map = {
    pendiente: { label: "En revisión", cls: "bg-amber-100 text-amber-700" },
    rechazada: { label: "Rechazada", cls: "bg-red-100 text-red-700" },
  } as const;
  const c = map[estado];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
        c.cls,
        className,
      )}
    >
      {c.label}
    </span>
  );
}
