import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import { KARTA_VIEWBOX, REGION_BANOR } from "@/lib/sverige-karta";

/**
 * Diagrammen i adminpanelen. Alla ritas som SVG på servern – ingen
 * diagramlibb och ingen JavaScript i webbläsaren.
 *
 * Färgerna är inte valda på känsla utan körda genom validering mot den
 * mörka kortytan (#161a1c): ljushetsband, kromatröskel, separation vid
 * färgblindhet och kontrast mot ytan.
 *
 * Turkos, blå och orange först – det är dem ringen känns igen på i
 * designunderlaget. Underlagets två sista toner var däremot en andra blå
 * och en andra orange intill de första, och just den kombinationen
 * kollapsar: orange mot bärnsten hamnade på ΔE 10,6 för normalseende, och
 * den mörkblå på 2,17:1 mot kortytan. De två platserna är därför omstegade
 * till violett och bärnsten, som ligger klart isär.
 */

/** Kategorisk palett, plats 1–5 i fast ordning. Aldrig omkastad. */
export const SERIES = [
  "#2aa79c",
  "#3987e5",
  "#d95926",
  "#9085e9",
  "#c98500",
] as const;

/** Sekventiell turkos skala för kartan, låg → hög. */
const RAMP = ["#31615c", "#33827a", "#37a79c", "#4ac6bb", "#7ae3d9"] as const;

const AXIS = "#6b7476";
const GRID = "#272d2f";
const SURFACE = "#161a1c";

/* ------------------------------------------------------------------ Kort */

export function ChartCard({
  title,
  action,
  footer,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-4">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action}
      </div>
      <div className="flex-1 px-5 pb-4">{children}</div>
      {footer ? (
        <div className="border-t border-line px-5 py-3.5">{footer}</div>
      ) : null}
    </section>
  );
}

/* ----------------------------------------------------------------- Donut */

export type Slice = { label: string; value: number };

/**
 * Del av helhet på en blick. Högst sex segment, och varje segment står
 * också med siffra och andel i teckenförklaringen – färgen är alltså
 * aldrig det enda som skiljer dem åt.
 */
export function Donut({
  slices,
  centerLabel,
}: {
  slices: Slice[];
  centerLabel: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 54;
  const omkrets = 2 * Math.PI * r;
  const gap = 2; // yta mellan segmenten, i banans längdenhet

  const andel = (v: number) => (total === 0 ? 0 : v / total);
  const banor = slices.map((s, i) => {
    // Startpunkten är summan av allt före segmentet – räknas fram i stället
    // för att skrivas upp i en yttre variabel, så funktionen förblir ren.
    const fore = slices
      .slice(0, i)
      .reduce((sum, x) => sum + andel(x.value), 0);
    return {
      ...s,
      langd: Math.max(andel(s.value) * omkrets - gap, 0),
      offset: fore * omkrets,
      farg: SERIES[i % SERIES.length],
      andel: andel(s.value),
    };
  });

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-[150px] w-[150px] shrink-0">
        <g transform="rotate(-90 70 70)">
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={GRID}
            strokeWidth="22"
          />
          {banor.map((b) => (
            <circle
              key={b.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={b.farg}
              strokeWidth="22"
              strokeDasharray={`${b.langd} ${omkrets - b.langd}`}
              strokeDashoffset={-b.offset}
            >
              <title>{`${b.label}: ${b.value} (${Math.round(b.andel * 100)}%)`}</title>
            </circle>
          ))}
        </g>
        <text
          x="70"
          y="66"
          textAnchor="middle"
          className="fill-fg text-[20px] font-bold"
        >
          {total}
        </text>
        <text
          x="70"
          y="80"
          textAnchor="middle"
          className="fill-fg-muted text-[8px]"
        >
          {centerLabel}
        </text>
      </svg>

      <ul className="min-w-[150px] flex-1 space-y-2.5">
        {banor.map((b) => (
          <li key={b.label} className="flex items-center gap-2.5 text-[13px]">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: b.farg }}
            />
            <span className="min-w-0 flex-1 truncate text-fg-muted">
              {b.label}
            </span>
            <span className="shrink-0 tabular-nums text-fg">
              {b.value}{" "}
              <span className="text-fg-muted">
                ({Math.round(b.andel * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------ Linjediagram */

export type Point = { label: string; value: number };

/**
 * En serie över tid. Ingen teckenförklaring behövs – rubriken namnger
 * serien. Hovring ger hårkors och värde via ren CSS, utan skript.
 */
export function LineChart({
  points,
  unit = "",
}: {
  points: Point[];
  unit?: string;
}) {
  const W = 520;
  const H = 210;
  const pad = { top: 12, right: 12, bottom: 26, left: 40 };
  const inner = { w: W - pad.left - pad.right, h: H - pad.top - pad.bottom };

  const max = Math.max(...points.map((p) => p.value), 1);
  // Rund upp till en jämn nivå så att axeln får läsbara steg.
  const steg = Math.max(1, Math.ceil(max / 4 / 10) * 10);
  const topp = steg * 4;

  const x = (i: number) =>
    pad.left + (points.length <= 1 ? inner.w / 2 : (i / (points.length - 1)) * inner.w);
  const y = (v: number) => pad.top + inner.h - (v / topp) * inner.h;

  const linje = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const yta = `${pad.left},${pad.top + inner.h} ${linje} ${x(points.length - 1)},${pad.top + inner.h}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[210px] w-full">
      {/* Stödlinjer och skala */}
      {[0, 1, 2, 3, 4].map((i) => {
        const v = steg * i;
        return (
          <g key={i}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={y(v)}
              y2={y(v)}
              stroke={GRID}
              strokeWidth="1"
            />
            <text
              x={pad.left - 8}
              y={y(v) + 3}
              textAnchor="end"
              className="fill-fg-dim text-[9px]"
            >
              {v} {unit}
            </text>
          </g>
        );
      })}

      <polygon points={yta} fill="var(--color-chart)" opacity="0.14" />
      <polyline
        points={linje}
        fill="none"
        stroke="var(--color-chart)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <g key={p.label} className="viz-band">
          <circle
            cx={x(i)}
            cy={y(p.value)}
            r="4"
            fill="var(--color-chart)"
            stroke={SURFACE}
            strokeWidth="2"
          />
          <text
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            className="fill-fg-dim text-[9px]"
          >
            {p.label}
          </text>

          {/* Hovringslager: hårkors och värde */}
          <line
            className="viz-hover"
            x1={x(i)}
            x2={x(i)}
            y1={pad.top}
            y2={pad.top + inner.h}
            stroke={AXIS}
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <g className="viz-hover">
            <rect
              x={Math.min(Math.max(x(i) - 38, 2), W - 78)}
              y={Math.max(y(p.value) - 32, 2)}
              width="76"
              height="24"
              rx="6"
              fill="#1e2325"
              stroke={GRID}
            />
            <text
              x={Math.min(Math.max(x(i), 40), W - 40)}
              y={Math.max(y(p.value) - 15, 19)}
              textAnchor="middle"
              className="fill-fg text-[10px] font-medium"
            >
              {p.label}: {p.value} {unit}
            </text>
          </g>
          <rect
            x={x(i) - inner.w / Math.max(points.length, 1) / 2}
            y={pad.top}
            width={inner.w / Math.max(points.length, 1)}
            height={inner.h}
            fill="transparent"
          />
        </g>
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------- Stapellista */

/**
 * Vågräta staplar för en enda serie. Samma färg på alla – stapelns längd
 * bär storleken, färgen behöver inte göra om samma jobb.
 */
export function BarList({
  rows,
}: {
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-fg">{r.label}</span>
            <span className="shrink-0 tabular-nums text-[13px] text-fg-muted">
              {r.value}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-chart"
              style={{ width: `${(r.value / max) * 100}%` }}
              title={`${r.label}: ${r.value}`}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ Sverigekarta */

/**
 * Karta över ekipagen per region. Banorna kommer från Sveriges riktiga
 * länsgränser (öppna data, se data/KALLA.md) och genereras av
 * scripts/generate-sweden-map.mjs – regionerna är alltså landet självt,
 * inte en ritad symbol. Färgen visar antal ekipage på en skala i en enda
 * ton, så att mörkare läses som fler utan förklaring.
 */
export function SwedenMap({
  regions,
  className = "h-[190px] w-auto shrink-0",
}: {
  regions: { code: string; name: string; teams: number }[];
  className?: string;
}) {
  const max = Math.max(...regions.map((r) => r.teams), 1);
  const steg = (n: number) =>
    RAMP[Math.min(RAMP.length - 1, Math.round((n / max) * (RAMP.length - 1)))];

  return (
    <svg
      viewBox={KARTA_VIEWBOX}
      className={className}
      role="img"
      aria-label="Ekipage per region"
    >
      {regions.map((r) => {
        const d = REGION_BANOR[r.code];
        if (!d) return null;
        return (
          <path
            key={r.code}
            d={d}
            fill={steg(r.teams)}
            stroke={SURFACE}
            strokeWidth="1.8"
            fillRule="evenodd"
          >
            <title>{`${r.name}: ${r.teams} ekipage`}</title>
          </path>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------- Nyckeltal */

export function KpiCard({
  icon,
  label,
  value,
  change,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  change?: { text: string; direction: "up" | "down" | "flat" } | null;
}) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9.5px] font-semibold uppercase leading-tight tracking-[0.08em] text-fg-dim">
          {label}
        </p>
        <p className="mt-1.5 text-[26px] font-bold leading-none">{value}</p>
        {change ? (
          <p
            className={`mt-2 text-[11px] leading-snug ${
              change.direction === "up"
                ? "text-ok"
                : change.direction === "down"
                  ? "text-danger"
                  : "text-fg-dim"
            }`}
          >
            {change.direction === "up"
              ? "▲"
              : change.direction === "down"
                ? "▼"
                : "•"}{" "}
            {change.text}
          </p>
        ) : (
          <p className="mt-2 text-[11px] text-fg-dim">Ingen jämförelse</p>
        )}
      </div>
    </div>
  );
}

/** Talformat med svenskt decimaltecken, för nyckeltalen. */
export const kpi = (n: number) => formatNumber(n, 0);
