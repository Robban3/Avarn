import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ChartCard } from "@/components/AdminCharts";
import { StatusDot, Table, Td, Th } from "@/components/PanelUI";
import { Avatar } from "@/components/ui";
import { requireCapability } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatShortDate } from "@/lib/format";
import { ALL_ROLES, ROLE_LABELS, type Role } from "@/lib/domain";
import { UserForm } from "../../admin/user-form";
import { toggleUserActive } from "../../admin/actions";
import { ResetPasswordButton } from "../../admin/reset-password";

export const metadata: Metadata = { title: "Användare & roller" };

export default async function PanelUsersPage() {
  const admin = await requireCapability("admin:manage");

  const [users, regions] = await Promise.all([
    // select, inte include – annars följer passwordHash med.
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
        regionId: true,
        region: true,
        _count: { select: { teams: true } },
      },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    db.region.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const perRoll = ALL_ROLES.map((roll) => ({
    roll,
    antal: users.filter((u) => u.role === roll).length,
  }));

  return (
    <AdminShell
      user={admin}
      aktiv="/panel/anvandare"
      title="Användare & roller"
      subtitle={`${users.filter((u) => u.active).length} aktiva av ${users.length}`}
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {perRoll.map(({ roll, antal }) => (
          <div key={roll} className="card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
              {ROLE_LABELS[roll as Role]}
            </p>
            <p className="mt-1.5 text-[24px] font-bold leading-none">{antal}</p>
          </div>
        ))}
      </div>

      <ChartCard
        title="Alla användare"
        action={
          <UserForm
            regions={regions.map((r) => ({ id: r.id, name: r.name }))}
            roles={[...ALL_ROLES]}
          />
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Namn</Th>
              <Th>E-post</Th>
              <Th>Roll</Th>
              <Th>Region</Th>
              <Th className="text-right">Ekipage</Th>
              <Th>Skapad</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <Td>
                  <span className="flex items-center gap-2.5 font-medium">
                    <Avatar name={u.name} size={30} />
                    {u.name}
                  </span>
                </Td>
                <Td className="text-fg-muted">{u.email}</Td>
                <Td className="whitespace-nowrap text-fg-muted">
                  {ROLE_LABELS[u.role as Role] ?? u.role}
                </Td>
                <Td className="whitespace-nowrap text-fg-muted">
                  {u.region?.name ?? "–"}
                </Td>
                <Td className="text-right tabular-nums">
                  {u._count.teams}
                </Td>
                <Td className="whitespace-nowrap text-fg-dim">
                  {formatShortDate(u.createdAt)}
                </Td>
                <Td>
                  <StatusDot ok={u.active}>
                    {u.active ? "Aktiv" : "Avstängd"}
                  </StatusDot>
                </Td>
                <Td>
                  <span className="flex items-center justify-end gap-2">
                    <ResetPasswordButton userId={u.id} />
                    {u.id === admin.id ? null : (
                      <form action={toggleUserActive}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          className="whitespace-nowrap rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-fg-muted transition-colors hover:bg-surface-2"
                        >
                          {u.active ? "Stäng av" : "Aktivera"}
                        </button>
                      </form>
                    )}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ChartCard>
    </AdminShell>
  );
}
