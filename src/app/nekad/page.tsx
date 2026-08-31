import Link from "next/link";
import type { Metadata } from "next";
import { LockIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Åtkomst nekad" };

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-fg-muted">
        <LockIcon className="h-7 w-7" />
      </div>
      <h1 className="text-lg font-semibold">Åtkomst nekad</h1>
      <p className="mt-2 max-w-xs text-sm text-fg-muted">
        Din roll har inte behörighet till den här vyn. Kontakta din regionalt
        ansvariga om du behöver utökad åtkomst.
      </p>
      <Link href="/hem" className="btn btn-secondary mt-6">
        Till startsidan
      </Link>
    </main>
  );
}
