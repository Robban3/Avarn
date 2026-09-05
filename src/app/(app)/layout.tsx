import { Servicearbetare } from "@/components/Servicearbetare";
import { Synkare } from "@/components/Offline";
import { requireUser } from "@/lib/auth";

/**
 * Alla sidor i den här gruppen kräver inloggning. Middleware fångar det
 * mesta, men kontrollen görs även här så att en sida aldrig kan renderas
 * utan en giltig session.
 *
 * Synkaren ligger här och inte i en enskild vy: kön ska tömmas var man än
 * befinner sig i appen. Statusraden som visar läget hör däremot hemma där
 * registreringarna görs, och mounteras av de sidorna.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUser();
  return (
    <>
      <Servicearbetare />
      <Synkare />
      {children}
    </>
  );
}
