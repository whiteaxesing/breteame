import Link from "next/link";
import { Wrench } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export async function SiteHeader() {
  const session = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Breteame</span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {session ? (
            <UserMenu
              email={session.user.email ?? ""}
              fullName={session.profile?.full_name ?? null}
              role={session.profile?.role ?? "cliente"}
            />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Iniciá sesión</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
