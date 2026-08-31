import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Badge, EmptyState, LinkCard } from "@/components/ui";
import { ClipboardIcon, SearchIcon } from "@/components/icons";
import { requireUser, unreadNotificationCount } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatShortDate } from "@/lib/format";
import { REPORT_STATUS_LABELS } from "@/lib/domain";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Rapporter" };

export default async function ReportsPage({
  searchParams,
}: PageProps<"/rapporter">) {
  const user = await requireUser();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const unread = await unreadNotificationCount(user.id);

  // Fritextsökningen träffar det man faktiskt letar efter i efterhand:
  // uppdragsnummer, plats, fynd och avvikelser.
  const search: Prisma.OperationalReportWhereInput = query
    ? {
        OR: [
          { mission: { reference: { contains: query } } },
          { mission: { title: { contains: query } } },
          { mission: { locality: { contains: query } } },
          { areasSearched: { contains: query } },
          { findings: { contains: query } },
          { deviations: { contains: query } },
        ],
      }
    : {};

  const reports = await db.operationalReport.findMany({
    where: { AND: [{ team: teamScope(user) }, search] },
    include: {
      mission: { include: { discipline: true } },
      team: { include: { dog: true, handler: true } },
      author: true,
      _count: { select: { indications: true, media: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AppShell title="Rapporter" unread={unread} role={user.role}>
      <form action="/rapporter" className="mb-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-fg-dim" />
          <label className="sr-only" htmlFor="q">
            Sök i rapporter
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Sök på uppdrag, plats eller fynd"
            className="field pl-10"
          />
        </div>
      </form>

      {reports.length === 0 ? (
        <EmptyState
          icon={<ClipboardIcon className="h-7 w-7" />}
          title={query ? "Inga träffar" : "Inga rapporter"}
          description={
            query
              ? "Prova ett annat sökord."
              : "Rapporter fylls i efter avslutat uppdrag och samlas här."
          }
        />
      ) : (
        <div className="space-y-2.5">
          {reports.map((report) => (
            <LinkCard key={report.id} href={`/rapporter/${report.id}`}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-xs text-fg-muted">
                  {report.mission.reference} ·{" "}
                  {formatShortDate(report.mission.startAt)}
                </p>
                <Badge
                  tone={
                    report.status === "APPROVED"
                      ? "ok"
                      : report.status === "SUBMITTED"
                        ? "brand"
                        : "neutral"
                  }
                >
                  {REPORT_STATUS_LABELS[report.status] ?? report.status}
                </Badge>
              </div>
              <p className="truncate text-[15px] font-semibold">
                {report.mission.title}
              </p>
              <p className="truncate text-xs text-fg-muted">
                {report.mission.locality} · {report.team.dog.name} ·{" "}
                {report.author.name}
              </p>
              {report.findings ? (
                <p className="mt-1 truncate text-xs text-fg-dim">
                  {report.findings}
                </p>
              ) : null}
              {report._count.indications > 0 ? (
                <p className="mt-1 text-xs text-brand">
                  {report._count.indications} markering
                  {report._count.indications === 1 ? "" : "ar"}
                </p>
              ) : null}
            </LinkCard>
          ))}
        </div>
      )}

      <p className="mt-5 text-center text-xs text-fg-dim">
        Rapporter kan innehålla skyddsvärd information. Åtkomsten är begränsad
        efter roll och region, och läsning loggas.
      </p>

      <Link href="/uppdrag" className="btn btn-secondary mt-4 w-full">
        Till uppdragen
      </Link>
    </AppShell>
  );
}
