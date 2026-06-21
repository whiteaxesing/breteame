"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Mode = "signin" | "signup";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            nonce: string;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type: "standard";
              theme: "outline" | "filled_blue" | "filled_black";
              size: "large" | "medium" | "small";
              text: "continue_with" | "signin_with" | "signup_with";
              shape: "rectangular" | "pill";
              width: number;
            },
          ) => void;
        };
      };
    };
  }
}

// Supabase exige el nonce sin hashear; a Google se le manda el hash (SHA-256)
// para que el ID token lo incluya y se pueda verificar que no es un replay.
async function generateNonce(): Promise<[string, string]> {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [raw, hashed];
}

const DEMO_ACCOUNTS = [
  { label: "Cliente", email: "cliente@demo.cr" },
  { label: "Profesional", email: "pro@demo.cr" },
  { label: "Admin", email: "admin@demo.cr" },
];

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function finish() {
    router.push(next);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    if (mode === "signup" && confirmEmail) {
      // Bot detectado — fingir éxito sin hacer nada
      setLoading(false);
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Correo o contraseña incorrectos.");
        setLoading(false);
        return;
      }
      finish();
      return;
    }

    // signup (siempre como cliente; el rol lo administra el seed/admin)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // Si "Confirm email" está activado en Supabase, el link del correo
        // tiene que pasar por /auth/callback para intercambiar el code por
        // sesión — si no, Supabase usa el Site URL tal cual (sin /auth/callback)
        // y el usuario cae logueado a medias en la home.
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (!data.session) {
      // La confirmación por email puede estar activada en Supabase.
      const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
      if (e2) {
        setInfo("Cuenta creada. Revisá tu correo para confirmarla y luego iniciá sesión.");
        setMode("signin");
        setLoading(false);
        return;
      }
    }
    finish();
  }

  useEffect(() => {
    // Si el script de Google ya estaba cacheado (navegación interna sin
    // recarga), su onLoad no vuelve a dispararse — lo inicializamos acá.
    if (window.google) initGoogleButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initGoogleButton() {
    if (!window.google || !googleButtonRef.current) return;
    const [nonce, hashedNonce] = await generateNonce();
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      nonce: hashedNonce,
      callback: async (response) => {
        setError(null);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
          nonce,
        });
        if (error) {
          setError("No se pudo iniciar con Google.");
          return;
        }
        finish();
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: googleButtonRef.current.clientWidth || 384,
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">
          {mode === "signin" ? "Iniciá sesión" : "Creá tu cuenta de cliente"}
        </CardTitle>
        <CardDescription>
          {mode === "signin"
            ? "Necesitás una cuenta para contactar a los profesionales."
            : "Para contactar profesionales verificados. "}
          {mode === "signup" && (
            <>
              ¿Sos profesional?{" "}
              <Link href="/unirse" className="font-medium text-primary underline-offset-4 hover:underline">
                Aparecé en Breteame
              </Link>
              .
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initGoogleButton}
        />
        <div ref={googleButtonRef} className="flex w-full justify-center" />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">o con tu correo</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vos@correo.com"
              required
            />
          </div>
          {mode === "signup" && (
            <input
              type="email"
              name="email_confirm"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px" }}
            />
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-muted-foreground">{info}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {mode === "signin" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setConfirmEmail("");
              setError(null);
              setInfo(null);
            }}
          >
            {mode === "signin" ? "Registrate" : "Iniciá sesión"}
          </button>
        </p>

        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Cuentas de prueba (contraseña: demo1234)
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button
                key={a.email}
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setMode("signin");
                  setEmail(a.email);
                  setPassword("demo1234");
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
