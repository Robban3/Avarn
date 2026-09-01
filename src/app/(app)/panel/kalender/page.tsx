import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { requirePanelUser } from "@/lib/auth";
import { seesAllRegions, teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { dateKey, formatTime } from "@/lib/format";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = { title: "Kalender" };

const VECKODAGAR = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

/** Månadens rutnät: hela veckor, måndag först, som en svensk almanacka. */
function manadsrutnat(ar: number, manad: number) {
  const forsta = new Date(Date.UTC(ar, manad, 1));
  // getUTCDay ger 0 för söndag; vi vill ha måndag som 0.
  const skift = (forsta.getUTCDay() + 6) % 7;
  const start = new Date(forsta);
  start.setUTCDate(start.getUTCDate() - skift);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return d;
  });
}

export default async function PanelCalendarPage({
  searchParams,
}: PageProps<"/panel/kalender">) {
  const user = await requirePanelUser();
  const params = await searchParams;

  const idag = new Date();
  const ar = Number(params.ar) || idag.getUTCFullYear();
  const manad = Number(params.manad ?? NaN);
  const m = Number.isInteger(manad) ? manad : idag.getUTCMonth();

  const rutor = manadsrutnat(ar, m);
  const fran = rutor[0];
  const till = new Date(rutor[41]);
  till.setUTCDate(till.getUTCDate() + 1);

  const teamIds = (
    await db.team.findMany({ where: teamScope(user), select: { id: true } })
  ).map((t) => t.id);

  const synlighet: Prisma.MissionWhereInput = seesAllRegions(user)
    ? {}
    : { assignments: { some: { teamId: { in: teamIds } } } };

  const [uppdrag, pass] = await Promise.all([
    db.mission.findMany({
      where: { AND: [synlighet, { startAt: { gte: fran, lt: till } }] },
      select: { id: true, title: true, startAt: true },
      orderBy: { startAt: "asc" },
    }),
    db.trainingSession.findMany({
      where: { team: teamScope(user), startAt: { gte: fran, lt: till } },
      select: { id: true, trainingArea: true, startAt: true },
      orderBy: { startAt: "asc" },
    }),
  ]);

  type Post = { id: string; text: string; at: Date; href: string; typ: "u" | "t" };
  const perDag = new Map<string, Post[]>();
  const lagg = (p: Post) => {
    const nyckel = dateKey(p.at);
    perDag.set(nyckel, [...(perDag.get(nyckel) ?? []), p]);
  };
  for (const u of uppdrag)
    lagg({ id: u.id, text: u.title, at: u.startAt, href: `/uppdrag/${u.id}`, typ: "u" });
  for (const t of pass)
    lagg({ id: t.id, text: t.trainingArea, at: t.startAt, href: `/traning/${t.id}`, typ: "t" });

  const manadsnamn = new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ar, m, 1)));

  const foreg = m === 0 ? { ar: ar - 1, manad: 11 } : { ar, manad: m - 1 };
  const nasta = m === 11 ? { ar: ar + 1, manad: 0 } : { ar, manad: m + 1 };
  const idagNyckel = dateKey(idag);

  return (
    <AdminShell
      user={user}
      aktiv="/panel/kalender"
      title="Kalender"
      subtitle={`${uppdrag.length} uppdrag och ${pass.length} träningspass i vyn`}
    >
      <ChartCard
        title={manadsnamn.charAt(0).toUpperCase() + manadsnamn.slice(1)}
        action={
          <div className="flex gap-1">
            <Link
              href={`/panel/kalender?ar=${foreg.ar}&manad=${foreg.manad}`}
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-fg-muted transition-colors hover:bg-surface-2"
            >
              Föregående
            </Link>
            <Link
              href="/panel/kalender"
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-fg-muted transition-colors hover:bg-surface-2"
            >
              Idag
            </Link>
            <Link
              href={`/panel/kalender?ar=${nasta.ar}&manad=${nasta.manad}`}
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-fg-muted transition-colors hover:bg-surface-2"
            >
              Nästa
            </Link>
          </div>
        }
      >
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-line">
          {VECKODAGAR.map((d) => (
            <div
              key={d}
              className="bg-surface px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-dim"
            >
              {d}
            </div>
          ))}
          {rutor.map((d) => {
            const nyckel = dateKey(d);
            const poster = perDag.get(nyckel) ?? [];
            const iManaden = d.getUTCMonth() === m;
            return (
              <div
                key={nyckel}
                className={`min-h-[104px] bg-surface p-2 ${
                  iManaden ? "" : "opacity-40"
                }`}
              >
                <p
                  className={`mb-1.5 text-[12px] font-semibold ${
                    nyckel === idagNyckel ? "text-brand" : "text-fg-muted"
                  }`}
                >
                  {d.getUTCDate()}
                </p>
                <ul className="space-y-1">
                  {poster.slice(0, 3).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={p.href}
                        title={`${formatTime(p.at)} ${p.text}`}
                        className={`block truncate rounded px-1.5 py-1 text-[11px] transition-colors ${
                          p.typ === "u"
                            ? "bg-brand/12 text-brand hover:bg-brand/20"
                            : "bg-surface-2 text-fg-muted hover:bg-surface-3"
                        }`}
                      >
                        {formatTime(p.at)} {p.text}
                      </Link>
                    </li>
                  ))}
                  {poster.length > 3 ? (
                    <li className="px-1.5 text-[11px] text-fg-dim">
                      +{poster.length - 3} till
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-3 flex gap-4 text-[12px] text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded bg-brand/40" />
            Uppdrag
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded bg-surface-3" />
            Träningspass
          </span>
        </p>
      </ChartCard>
    </AdminShell>
  );
}
