import Link from "next/link";
import type { Metadata } from "next";
import { CompassIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Sidan finns inte" };

/**
 * Svaret på en adress som inte leder någonstans – och på en post som ligger
 * utanför användarens behörighet. De två fallen ska se likadana ut: ett
 * "du saknar behörighet" skulle avslöja att posten finns.
 */
export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-fg-muted">
        <CompassIcon className="h-7 w-7" />
      </div>
      <h1 className="text-lg font-semibold">Sidan finns inte</h1>
      <p className="mt-2 max-w-xs text-sm text-fg-muted">
        Adressen leder ingenstans, eller så ligger uppgifterna utanför din
        behörighet. Har du fått länken av en kollega kan den gälla ett annat
        ekipage.
      </p>
      <p className="mt-2 max-w-xs text-sm text-fg-muted">
        Kontakta din regionalt ansvariga om du behöver utökad åtkomst.
      </p>
      <Link href="/hem" className="btn btn-secondary mt-6">
        Till startsidan
      </Link>
    </main>
  );
}
