import { requireUser } from "@/lib/auth";

/**
 * Alla sidor i den här gruppen kräver inloggning. Middleware fångar det
 * mesta, men kontrollen görs även här så att en sida aldrig kan renderas
 * utan en giltig session.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUser();
  return children;
}
