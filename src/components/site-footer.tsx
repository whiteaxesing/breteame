import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold tracking-tight">Breteame</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Profesionales verificados en Costa Rica, directo por WhatsApp o
              llamada.
            </p>
          </div>
          <nav aria-label="Categorías">
            <p className="text-sm font-semibold">Oficios</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/?category=${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Enlaces">
            <p className="text-sm font-semibold">Breteame</p>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link
                  href="/unirse"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Unite como profesional
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Breteame · Hecho en Costa Rica
        </p>
      </div>
    </footer>
  );
}
