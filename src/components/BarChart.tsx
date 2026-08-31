/**
 * Enkelt stapeldiagram, serverrenderat som SVG. En serie i taget – därför
 * behövs ingen legend och ingen kategorisk palett. Varje stapel har ett
 * eget värde utskrivet och en title för pekarhjälp.
 */

type Bar = { label: string; value: number };

export function BarChart({
  data,
  unit = "",
  height = 150,
  caption,
}: {
  data: Bar[];
  /** Skrivs efter värdet i etiketten, t.ex. "h". */
  unit?: string;
  height?: number;
  caption: string;
}) {
  if (data.length === 0) {
    return <p className="px-4 py-4 text-sm text-fg-muted">Ingen data ännu.</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;
  const plotHeight = height - 34; // plats för värde ovanför och etikett under

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="h-[150px] w-full"
        role="img"
        aria-label={caption}
      >
        {/* Grundlinje, medvetet diskret */}
        <line
          x1="0"
          y1={plotHeight + 14}
          x2="100"
          y2={plotHeight + 14}
          stroke="var(--color-line)"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const barHeight = (d.value / max) * plotHeight;
          // 2 px luft mellan staplarna, uttryckt i diagrammets skala
          const gap = barWidth * 0.28;
          const x = i * barWidth + gap / 2;
          const w = barWidth - gap;
          const y = plotHeight + 14 - barHeight;

          return (
            <g key={d.label}>
              <title>{`${d.label}: ${d.value}${unit ? ` ${unit}` : ""}`}</title>
              <rect
                x={x}
                y={y}
                width={w}
                height={Math.max(barHeight, 0.8)}
                rx="1.2"
                fill="var(--color-chart)"
              />
            </g>
          );
        })}
      </svg>

      {/* Värden och etiketter som text, så att de inte skalas snett av
          preserveAspectRatio="none" i SVG:en ovan. */}
      <div className="-mt-[150px] flex h-[150px] flex-col justify-between">
        <div className="flex">
          {data.map((d) => (
            <span
              key={`v-${d.label}`}
              className="flex-1 text-center text-[11px] font-semibold text-fg"
            >
              {d.value}
            </span>
          ))}
        </div>
        <div className="flex">
          {data.map((d) => (
            <span
              key={`l-${d.label}`}
              className="flex-1 text-center text-[10px] text-fg-dim"
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}

/** Liggande staplar när etiketterna är långa, t.ex. sökinriktningar. */
export function HorizontalBars({
  data,
  unit = "",
  caption,
}: {
  data: Bar[];
  unit?: string;
  caption: string;
}) {
  if (data.length === 0) {
    return <p className="px-4 py-4 text-sm text-fg-muted">Ingen data ännu.</p>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <figure className="m-0 space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-fg-muted">
            {d.label}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-chart"
              style={{ width: `${Math.max((d.value / max) * 100, 3)}%` }}
              title={`${d.label}: ${d.value}${unit ? ` ${unit}` : ""}`}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-semibold text-fg">
            {d.value}
          </span>
        </div>
      ))}
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}
