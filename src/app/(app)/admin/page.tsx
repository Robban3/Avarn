import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Avatar, Badge, SectionHeader } from "@/components/ui";
import { requireCapability, unreadNotificationCount } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { ALL_ROLES, ROLE_LABELS, type Role } from "@/lib/domain";
import { UserForm } from "./user-form";
import { toggleUserActive } from "./actions";
import { ResetPasswordButton } from "./reset-password";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminPage() {
  const admin = await requireCapability("admin:manage");
  const unread = await unreadNotificationCount(admin.id);

  const [users, regions, certTypes, disciplines, auditLog] = await Promise.all([
    db.user.findMany({
      include: { region: true },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    db.region.findMany({
      include: { _count: { select: { users: true, teams: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.certificationType.findMany({ orderBy: { name: "asc" } }),
    db.searchDiscipline.findMany({ orderBy: { sortOrder: "asc" } }),
    db.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <AppShell
      title="Administration"
      backHref="/mer"
      unread={unread}
      role={admin.role}
    >
      <section className="mb-5">
        <SectionHeader title={`Användare (${users.length})`} />
        <div className="card mb-3 divide-y divide-line-soft">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={u.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{u.name}</p>
                <p className="truncate text-xs text-fg-muted">{u.email}</p>
                <p className="truncate text-xs text-fg-dim">
                  {ROLE_LABELS[u.role as Role] ?? u.role}
                  {u.region ? ` · ${u.region.name}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge tone={u.active ? "ok" : "neutral"}>
                  {u.active ? "Aktiv" : "Avstängd"}
                </Badge>
                {u.id !== admin.id ? (
                  <>
                    <form action={toggleUserActive}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="text-xs text-fg-dim transition-colors hover:text-fg-muted"
                      >
                        {u.active ? "Stäng av" : "Aktivera"}
                      </button>
                    </form>
                    <ResetPasswordButton userId={u.id} />
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <UserForm
          regions={regions.map((r) => ({ id: r.id, name: r.name }))}
          roles={ALL_ROLES as Role[]}
        />
      </section>

      <section className="mb-5">
        <SectionHeader title="Regioner" />
        <div className="card divide-y divide-line-soft">
          {regions.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span>{r.name}</span>
              <span className="text-xs text-fg-muted">
                {r._count.teams} ekipage · {r._count.users} användare
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader title="Certifikattyper" />
        <div className="card divide-y divide-line-soft">
          {certTypes.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="min-w-0 truncate">{t.name}</span>
              <span className="shrink-0 text-xs text-fg-muted">
                {t.validityMonths} mån
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader title="Sökinriktningar" />
        <div className="card flex flex-wrap gap-2 p-4">
          {disciplines.map((d) => (
            <span key={d.id} className="chip">
              {d.name}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader title="Revisionslogg" />
        <div className="card divide-y divide-line-soft">
          {auditLog.length === 0 ? (
            <p className="px-4 py-4 text-sm text-fg-muted">
              Inga händelser loggade.
            </p>
          ) : (
            auditLog.map((entry) => (
              <div key={entry.id} className="px-4 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm">
                    <span className="text-fg-muted">{entry.action}</span>{" "}
                    {entry.entityType}
                    {entry.detail ? (
                      <span className="text-fg-dim"> · {entry.detail}</span>
                    ) : null}
                  </p>
                  <span className="shrink-0 text-xs text-fg-dim">
                    {formatRelative(entry.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-fg-dim">
                  {entry.user?.name ?? "Okänd användare"}
                </p>
              </div>
            ))
          )}
        </div>
        <p className="mt-2 text-xs text-fg-dim">
          Läsning av rapporter och uppdrag loggas eftersom innehållet kan vara
          skyddsvärt.
        </p>
      </section>
    </AppShell>
  );
}
