import type { Metadata } from "next";
import { AvarnLogo } from "@/components/AvarnLogo";
import { LockIcon } from "@/components/icons";
import { Rensacache } from "@/components/Servicearbetare";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Logga in" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const retur = typeof params.retur === "string" ? params.retur : undefined;

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      {/* Sessionsgränsen: cachen och kön töms här, både vid ut- och inloggning. */}
      <Rensacache />
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <AvarnLogo size="lg" />
        </div>

        <h1 className="mb-1 text-center text-xl font-semibold">Hundtjänst</h1>
        <p className="mb-8 text-center text-sm text-fg-muted">
          Operativt stöd för hundförare, instruktörer och ledning.
        </p>

        <div className="card p-6">
          <LoginForm retur={retur} />
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-fg-dim">
          <LockIcon className="h-4 w-4" />
          Innehåller skyddsvärd information. Logga ut när du är klar.
        </p>
      </div>
    </main>
  );
}
