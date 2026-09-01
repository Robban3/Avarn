import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { FeedRow, Table, Td, Th } from "@/components/PanelUI";
import { BellIcon, MessageIcon } from "@/components/icons";
import { requirePanelUser } from "@/lib/auth";
import { teamScope } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/domain";

export const metadata: Metadata = { title: "Meddelanden" };

export default async function PanelMessagesPage() {
  const user = await requirePanelUser();

  const [notiser, kommentarer] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    // Kommentarer inom behörigheten – panelens motsvarighet till en inkorg
    // för det som skrivs om ekipagen, inte bara det som riktas till mig.
    db.comment.findMany({
      where: {
        OR: [
          { trainingSession: { team: teamScope(user) } },
          { report: { team: teamScope(user) } },
        ],
      },
      include: {
        author: { select: { name: true } },
        trainingSession: { select: { id: true, trainingArea: true } },
        report: { select: { id: true, mission: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const olasta = notiser.filter((n) => !n.readAt).length;

  return (
    <AdminShell
      user={user}
      aktiv="/panel/meddelanden"
      title="Meddelanden"
      subtitle={`${olasta} olästa av ${notiser.length}`}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Mina notiser">
          {notiser.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-fg-muted">
              Inga notiser.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {notiser.map((n) => (
                <li key={n.id}>
                  <FeedRow
                    icon={<BellIcon className="h-4 w-4" />}
                    title={n.title}
                    subtitle={
                      n.body ??
                      NOTIFICATION_TYPE_LABELS[n.type] ??
                      n.type
                    }
                    meta={`${n.readAt ? "" : "Oläst · "}${formatRelative(n.createdAt)}`}
                    href={n.url ?? "/meddelanden"}
                  />
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Kommentarer om ekipagen">
          {kommentarer.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-fg-muted">
              Inga kommentarer.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Skriven av</Th>
                  <Th>Gäller</Th>
                  <Th>Kommentar</Th>
                  <Th>När</Th>
                </tr>
              </thead>
              <tbody>
                {kommentarer.map((k) => {
                  const href = k.trainingSession
                    ? `/traning/${k.trainingSession.id}`
                    : k.report
                      ? `/rapporter/${k.report.id}`
                      : "/meddelanden";
                  return (
                    <tr key={k.id}>
                      <Td className="whitespace-nowrap font-medium">
                        {k.author.name}
                      </Td>
                      <Td>
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-brand"
                        >
                          <MessageIcon className="h-3.5 w-3.5" />
                          {k.trainingSession?.trainingArea ??
                            k.report?.mission.title ??
                            "–"}
                        </Link>
                      </Td>
                      <Td className="text-fg-muted">
                        <span className="line-clamp-2">{k.body}</span>
                      </Td>
                      <Td className="whitespace-nowrap text-fg-dim">
                        {formatRelative(k.createdAt)}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </ChartCard>
      </div>
    </AdminShell>
  );
}
