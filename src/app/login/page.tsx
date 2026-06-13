import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Solo permitimos redirecciones internas (evita open redirect).
  const dest = next && next.startsWith("/") ? next : "/";

  const session = await getCurrentUser();
  if (session) redirect(dest);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <LoginForm next={dest} />
    </main>
  );
}
