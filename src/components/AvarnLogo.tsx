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
  // Stor storlek följer varumärkets stående lockup: märket över ordmärket.
  // Liten storlek ligger på rad, som i ett sidhuvud.
  if (size === "lg") {
    return (
      <span className={`inline-flex flex-col items-center ${className}`}>
        <AvarnMark className="h-[62px] w-[100px] text-brand" title="Avarn Security" />
        <span className="mt-4 flex flex-col leading-none">
          <span className="text-[34px] font-semibold tracking-[0.08em] text-fg">
            AVARN
          </span>
          <span className="mt-1.5 self-end text-[15px] font-normal tracking-[0.02em] text-fg-muted">
            Security
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <AvarnMark className="h-7 w-[45px] text-brand" title="Avarn Security" />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-semibold tracking-[0.06em] text-fg">
          AVARN
        </span>
        <span className="mt-0.5 self-end text-[9px] font-normal tracking-[0.02em] text-fg-muted">
          Security
        </span>
      </span>
    </span>
  );
}
