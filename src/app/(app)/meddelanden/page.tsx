import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionHeader } from "@/components/ui";
import {
  AlertIcon,
  BriefcaseIcon,
  CertificateIcon,
  CheckCircleIcon,
  MessageIcon,
  TrainingIcon,
} from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { markAllAsRead, markAsRead } from "./actions";

export const metadata: Metadata = { title: "Meddelanden" };

/** Ikon och färg per notifieringstyp. */
const TYPE_STYLE: Record<
  string,
  { Icon: typeof MessageIcon; className: string }
> = {
  MISSION_ASSIGNED: { Icon: BriefcaseIcon, className: "text-brand" },
  COMMENT: { Icon: MessageIcon, className: "text-brand" },
  TRAINING_PLANNED: { Icon: TrainingIcon, className: "text-brand" },
  CERT_EXPIRING: { Icon: CertificateIcon, className: "text-warn" },
  FOLLOW_UP: { Icon: AlertIcon, className: "text-warn" },
  SESSION_APPROVED: { Icon: CheckCircleIcon, className: "text-ok" },
};

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const unread = notifications.filter((n) => n.readAt === null);
  const read = notifications.filter((n) => n.readAt !== null);

  return (
    <AppShell title="Meddelanden" backHref="/hem" role={user.role}>
      {notifications.length === 0 ? (
        <EmptyState
          icon={<MessageIcon className="h-7 w-7" />}
          title="Inga meddelanden"
          description="Här visas nya uppdrag, kommentarer från instruktörer, planerad träning och behörigheter som snart löper ut."
        />
      ) : (
        <>
          {unread.length > 0 ? (
            <section className="mb-5">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="section-label">Olästa ({unread.length})</h2>
                <form action={markAllAsRead}>
                  <button type="submit" className="text-xs font-medium text-brand">
                    Markera alla som lästa
                  </button>
                </form>
              </div>
              <div className="card divide-y divide-line-soft">
                {unread.map((n) => {
                  const style = TYPE_STYLE[n.type] ?? {
                    Icon: MessageIcon,
                    className: "text-brand",
                  };
                  return (
                    <div key={n.id} className="flex gap-3 px-4 py-3.5">
                      <style.Icon
                        className={`mt-0.5 h-5 w-5 shrink-0 ${style.className}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold">{n.title}</p>
                          <span className="shrink-0 text-xs text-fg-dim">
                            {formatRelative(n.createdAt)}
                          </span>
                        </div>
                        {n.body ? (
                          <p className="mt-0.5 text-sm text-fg-muted">
                            {n.body}
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center gap-4">
                          {n.url ? (
                            <Link
                              href={n.url}
                              className="text-xs font-medium text-brand"
                            >
                              Öppna
                            </Link>
                          ) : null}
                          <form action={markAsRead}>
                            <input
                              type="hidden"
                              name="notificationId"
                              value={n.id}
                            />
                            <button
                              type="submit"
                              className="text-xs text-fg-dim transition-colors hover:text-fg-muted"
                            >
                              Markera som läst
                            </button>
                          </form>
                        </div>
                      </div>
                      <span
                        aria-hidden
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand"
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {read.length > 0 ? (
            <section>
              <SectionHeader title="Tidigare" />
              <div className="card divide-y divide-line-soft">
                {read.map((n) => {
                  const style = TYPE_STYLE[n.type] ?? {
                    Icon: MessageIcon,
                    className: "text-fg-dim",
                  };
                  const content = (
                    <>
                      <style.Icon className="mt-0.5 h-5 w-5 shrink-0 text-fg-dim" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-fg-muted">{n.title}</p>
                          <span className="shrink-0 text-xs text-fg-dim">
                            {formatRelative(n.createdAt)}
                          </span>
                        </div>
                        {n.body ? (
                          <p className="mt-0.5 text-sm text-fg-dim">{n.body}</p>
                        ) : null}
                      </div>
                    </>
                  );
                  return n.url ? (
                    <Link
                      key={n.id}
                      href={n.url}
                      className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id} className="flex gap-3 px-4 py-3.5">
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
