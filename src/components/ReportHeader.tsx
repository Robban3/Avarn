import { Badge } from "./ui";
import {
  formatDayNumber,
  formatMonthShort,
  formatTimeRange,
} from "@/lib/format";
import { REPORT_STATUS_LABELS, reportTone } from "@/lib/domain";

/**
 * Rapportens huvud: vilket uppdrag den gäller och var den står.
 *
 * Samma kort både när rapporten fylls i och när den läses, så att den som
 * öppnar en inskickad rapport ser exakt det hen såg när den skrevs.
 */
export function ReportHeader({
  mission,
  status,
}: {
  mission: {
    title: string;
    locality: string;
    startAt: Date;
    endAt: Date | null;
  };
  status: string;
}) {
  return (
    <section className="card mb-4 flex items-center gap-3 p-4">
      <div className="flex shrink-0 flex-col items-center leading-none">
        <span className="text-[22px] font-bold">
          {formatDayNumber(mission.startAt)}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
          {formatMonthShort(mission.startAt)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{mission.title}</p>
        <p className="truncate text-xs text-fg-muted">{mission.locality}</p>
        <p className="truncate text-xs text-fg-muted">
          {formatTimeRange(mission.startAt, mission.endAt)}
        </p>
      </div>
      <Badge tone={reportTone(status)}>
        {REPORT_STATUS_LABELS[status] ?? status}
      </Badge>
    </section>
  );
}
