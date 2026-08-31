/**
 * Avarns bildmärke: två korsande sicksacklinjer med punkter i varje ändpunkt.
 * Ritas som SVG så att det är skarpt i alla storlekar och kan färgsättas
 * med currentColor. Ordmärket "AVARN Security" är satt i apptypsnittet.
 */

type MarkProps = {
  className?: string;
  title?: string;
};

export function AvarnMark({ className = "h-8 w-8", title }: MarkProps) {
  return (
    <svg
      viewBox="0 0 200 124"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <g
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Stor topp: nedre vänster – mitten upp – nedre höger */}
        <path d="M10 114 L100 10 L190 114" />
        {/* Korsande dal: vänster axel – mitten ned – höger axel */}
        <path d="M58 20 L100 114 L142 20" />
      </g>
      <g fill="currentColor">
        <circle cx="10" cy="114" r="9" />
        <circle cx="100" cy="10" r="9" />
        <circle cx="190" cy="114" r="9" />
        <circle cx="58" cy="20" r="9" />
        <circle cx="100" cy="114" r="9" />
        <circle cx="142" cy="20" r="9" />
      </g>
    </svg>
  );
}

type LogoProps = {
  /** Storlek på ordmärket. "sm" i sidhuvud, "lg" på inloggningssidan. */
  size?: "sm" | "lg";
  className?: string;
};

export function AvarnLogo({ size = "sm", className = "" }: LogoProps) {
  const large = size === "lg";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <AvarnMark
        className={large ? "h-11 w-[70px] text-brand" : "h-7 w-[45px] text-brand"}
        title="Avarn Security"
      />
      <span className="flex flex-col leading-none">
        <span
          className={
            large
              ? "text-[28px] font-semibold tracking-[0.06em] text-fg"
              : "text-[17px] font-semibold tracking-[0.06em] text-fg"
          }
        >
          AVARN
        </span>
        <span
          className={
            large
              ? "mt-1 self-end text-[13px] font-normal tracking-[0.02em] text-fg-muted"
              : "mt-0.5 self-end text-[9px] font-normal tracking-[0.02em] text-fg-muted"
          }
        >
          Security
        </span>
      </span>
    </span>
  );
}
