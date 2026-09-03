import Link from "next/link";
import { ChevronRightIcon } from "./icons";
import { DisciplineTag } from "./ui";
import {
  dagsintervall,
  manadsrutnat,
  perDag,
  slagenFor,
  spalter,
  timfonster,
  veckans,
  type Handelse,
  type Slag,
} from "@/lib/kalender";
import { formatTime, weekdayIndex } from "@/lib/format";

/**
 * Kalenderns delar. Allt ritas på servern – vyn hålls i adressen, inte i
 * webbläsarens minne, så att bakåtknappen fungerar och sidan förblir en
 * serverkomponent som de andra listorna i appen.
 */

const VECKODAGAR = ["M", "T", "O", "T", "F", "L", "S"];

/** Prickarnas färg per slag. Samma tre färger i hela kalendern. */
const PRICK: Record<Slag, string> = {
  uppdrag: "bg-brand",
  traning: "bg-info",
  otillganglig: "bg-warn",
};

/* --------------------------------------------------------- Månadsrutnät */

export function Manadsrutnat({
  manad,
  vald,
  idag,
  handelser,
  href,
}: {
  /** En nyckel i månaden som ska visas. */
  manad: string;
  vald: string;
  idag: string;
  handelser: Handelse[];
  href: (dag: string) => string;
}) {
  const rutor = manadsrutnat(manad);
  const perDygn = perDag(
    handelser,
    rutor.map((r) => r.nyckel),
  );

  return (
    <>
      <div className="grid grid-cols-7">
        {VECKODAGAR.map((dag, i) => (
          <span
            key={i}
            className="text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-dim"
          >
            {dag}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7">
        {rutor.map(({ nyckel, iManaden }) => {
          const slag = slagenFor(perDygn.get(nyckel) ?? []);
          return (
            <Link
              key={nyckel}
              href={href(nyckel)}
              aria-current={nyckel === vald ? "date" : undefined}
              className="flex h-11 flex-col items-center justify-center gap-[3px]"
            >
              <span
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px] text-sm leading-none ${
                  nyckel === vald
                    ? "border-brand font-semibold text-brand"
                    : nyckel === idag
                      ? "border-transparent bg-surface-2 font-bold"
                      : iManaden
                        ? "border-transparent"
                        : "border-transparent text-fg-dim opacity-45"
                }`}
              >
                {Number(nyckel.slice(8))}
              </span>
              <span className="flex h-1 items-center gap-[3px]">
                {slag.map((s) => (
                  <span
                    key={s}
                    aria-hidden
                    className={`h-1 w-1 rounded-full ${PRICK[s]}`}
                  />
                ))}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

/** Raden som förklarar prickarna. */
export function Prickforklaring() {
  const poster: [Slag, string][] = [
    ["uppdrag", "Uppdrag"],
    ["traning", "Träning"],
    ["otillganglig", "Otillgänglig"],
  ];
  return (
    <div className="my-3.5 flex gap-3.5">
      {poster.map(([slag, etikett]) => (
        <span
          key={slag}
          className="inline-flex items-center gap-1.5 text-[11px] text-fg-dim"
        >
          <span aria-hidden className={`h-1 w-1 rounded-full ${PRICK[slag]}`} />
          {etikett}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Dagslistan */

/**
 * En rad i dagens lista. Samma mönster som startsidans kommande uppdrag,
 * men med klockslagen i brickan i stället för datumet – dagen står redan
 * i rubriken över listan, och tre likadana datum under varandra säger
 * ingenting.
 */
function Dagrad({ handelse }: { handelse: Handelse }) {
  const innehall = (
    <>
      <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-2 py-1.5">
        <span className="text-[13px] font-semibold leading-none">
          {formatTime(handelse.start)}
        </span>
        {handelse.slut ? (
          <span className="mt-[3px] text-[10px] leading-none text-fg-dim">
            {formatTime(handelse.slut)}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{handelse.rubrik}</p>
        {handelse.ort ? (
          <p className="mt-0.5 truncate text-xs text-fg-muted">
            {handelse.ort}
          </p>
        ) : null}
      </div>
      {handelse.tagg ? (
        <DisciplineTag
          label={handelse.tagg}
          tone={handelse.slag === "traning" ? "info" : "brand"}
        />
      ) : null}
      <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-fg-dim" />
    </>
  );

  const klass =
    "flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-surface-2";

  return handelse.href ? (
    <Link href={handelse.href} className={klass}>
      {innehall}
    </Link>
  ) : (
    <div className={klass}>{innehall}</div>
  );
}

export function Dagslista({ handelser }: { handelser: Handelse[] }) {
  return (
    <div className="card divide-y divide-line-soft">
      {handelser.map((h) => (
        <Dagrad key={h.id} handelse={h} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Veckorutnät */

/** Pixlar per timme. Nog för två rader text i ett block på en timme. */
const TIMHOJD = 38;
/** Luft ovanför första timstrecket, så att klockslaget får plats. */
const TOPPLUFT = 8;
/** Bredden på tidsaxeln. Varje kolumn behöver varenda pixel som blir kvar. */
const AXEL = 28;

const BLOCK: Record<Slag, string> = {
  uppdrag: "border-brand/45 bg-brand/15 text-brand",
  traning: "border-info/40 bg-info/15 text-info",
  otillganglig: "border-warn/35 bg-warn/12 text-warn",
};

export function Veckorutnat({
  dag,
  handelser,
  idag,
  href,
}: {
  dag: string;
  handelser: Handelse[];
  idag: string;
  href: (dag: string) => string;
}) {
  const dagar = veckans(dag);
  const perDygn = perDag(handelser, dagar);
  const fonster = timfonster(handelser, dagar);
  const timmar = Array.from(
    { length: fonster.till - fonster.fran + 1 },
    (_, i) => fonster.fran + i,
  );
  const hojd = TOPPLUFT + (timmar.length - 1) * TIMHOJD + 24;
  const kolumn = 100 / 7;
  const topp = (minuter: number) =>
    TOPPLUFT + ((minuter - fonster.fran * 60) / 60) * TIMHOJD;

  return (
    <>
      <div
        className="-mx-4 mb-1.5 grid"
        style={{ gridTemplateColumns: `${AXEL}px repeat(7, 1fr)` }}
      >
        <div />
        {dagar.map((d, i) => (
          <Link key={d} href={href(d)} className="text-center">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-dim">
              {VECKODAGAR[i]}
            </span>
            <span
              className={`mt-[3px] block text-[13px] ${
                d === idag
                  ? "font-bold text-brand"
                  : i > 4
                    ? "text-fg-dim"
                    : ""
              }`}
            >
              {Number(d.slice(8))}
            </span>
          </Link>
        ))}
      </div>

      {/* Rutnätet går kant i kant – sju kolumner på 390 px har inget att avvara. */}
      <div
        className="relative -mx-4 overflow-hidden border-y border-line bg-surface"
        style={{ height: hojd }}
      >
        {timmar.map((t, i) => (
          <span
            key={t}
            aria-hidden
            className="absolute border-t border-line-soft"
            style={{ top: TOPPLUFT + i * TIMHOJD, left: AXEL, right: 0 }}
          />
        ))}

        <div
          className="absolute inset-y-0 left-0 border-r border-line"
          style={{ width: AXEL }}
        >
          {timmar.map((t, i) => (
            <span
              key={t}
              className="absolute right-1 text-[9px] leading-none text-fg-dim"
              style={{ top: TOPPLUFT + i * TIMHOJD + 3 }}
            >
              {String(t).padStart(2, "0")}
            </span>
          ))}
        </div>

        <div className="absolute inset-y-0 right-0" style={{ left: AXEL }}>
          {dagar.slice(1).map((d, i) => (
            <span
              key={d}
              aria-hidden
              className="absolute inset-y-0 w-px bg-line-soft"
              style={{ left: `${kolumn * (i + 1)}%` }}
            />
          ))}

          {dagar.map((d, i) =>
            spalter(perDygn.get(d) ?? [], d).map(
              ({ handelse, spalt, antal }) => {
                const { fran, till } = dagsintervall(handelse, d);
                const bredd = kolumn / antal;
                return (
                  <Block
                    key={`${d}-${handelse.id}`}
                    handelse={handelse}
                    smal={antal > 1}
                    stil={{
                      top: topp(fran),
                      height: Math.max(16, topp(till) - topp(fran) - 2),
                      left: `calc(${kolumn * i + bredd * spalt}% + 2px)`,
                      width: `calc(${bredd}% - ${antal > 1 ? 3 : 4}px)`,
                    }}
                  />
                );
              },
            ),
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Ett block i veckorutnätet.
 *
 * Ett halvt block är runt tjugo pixlar brett. Vågrät text blir då en
 * bokstavsstapel, så etiketten ställs på högkant i stället – då får hela
 * namnet plats på en rad.
 */
function Block({
  handelse,
  smal,
  stil,
}: {
  handelse: Handelse;
  smal: boolean;
  stil: React.CSSProperties;
}) {
  const innehall = (
    <span
      className="block text-[8px] font-bold leading-tight"
      style={
        smal
          ? {
              writingMode: "vertical-rl",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              height: "100%",
              margin: "0 auto",
            }
          : { hyphens: "auto", overflowWrap: "break-word" }
      }
    >
      {handelse.rubrik}
    </span>
  );

  const klass = `absolute overflow-hidden rounded-md border ${
    smal ? "px-0.5 py-1" : "px-1 py-1"
  } ${BLOCK[handelse.slag]}`;

  const etikett = `${handelse.rubrik}, ${formatTime(handelse.start)}${
    handelse.slut ? `–${formatTime(handelse.slut)}` : ""
  }`;

  return handelse.href ? (
    <Link href={handelse.href} className={klass} style={stil} title={etikett}>
      {innehall}
    </Link>
  ) : (
    <div className={klass} style={stil} title={etikett}>
      {innehall}
    </div>
  );
}

/**
 * Krockarna i veckan, utskrivna under rutnätet.
 *
 * Två halva block bredvid varandra syns, men vad som krockar med vad står
 * inte att läsa i tjugo pixlar. Raden här är det egentliga beskedet.
 */
export function Krockar({
  dag,
  handelser,
}: {
  dag: string;
  handelser: Handelse[];
}) {
  const dagar = veckans(dag);
  const perDygn = perDag(handelser, dagar);
  const klocka = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  const texter = dagar.flatMap((d) => {
    // Otillgänglighet krockar inte med något – den är förklaringen till
    // varför dagen är tom, inte en dubbelbokning.
    const poster = (perDygn.get(d) ?? []).filter(
      (h) => h.slag !== "otillganglig",
    );
    const rader: string[] = [];
    for (let i = 0; i < poster.length; i += 1) {
      for (let j = i + 1; j < poster.length; j += 1) {
        const a = dagsintervall(poster[i], d);
        const b = dagsintervall(poster[j], d);
        const fran = Math.max(a.fran, b.fran);
        const till = Math.min(a.till, b.till);
        if (fran >= till) continue;
        rader.push(
          `${VECKODAGSNAMN[weekdayIndex(d)]} ${Number(d.slice(8))}: ` +
            `${poster[i].rubrik} och ${poster[j].rubrik} krockar ` +
            `${klocka(fran)}–${klocka(till)}.`,
        );
      }
    }
    return rader;
  });

  if (texter.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      {texter.map((text) => (
        <p key={text} className="text-[11px] text-warn">
          {text}
        </p>
      ))}
    </div>
  );
}

const VECKODAGSNAMN = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
];
