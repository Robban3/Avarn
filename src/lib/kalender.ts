import { addDaysKey, dateKey, startOfWeekKey, toLocalInput } from "./format";

/**
 * Räkningen bakom kalendern: rutnätet, grupperingen per dygn och
 * spaltindelningen som låter två krockande uppdrag ligga sida vid sida.
 *
 * Allt här är rena funktioner utan databas, så att veckovyns geometri går
 * att prova utan att starta appen. Själva hämtningen ligger i
 * `queries.ts`, med samma behörighetsavgränsning som övriga vyer.
 */

export type Slag = "uppdrag" | "traning" | "otillganglig";

export type Handelse = {
  id: string;
  slag: Slag;
  rubrik: string;
  /** Ort eller plats, raden under rubriken. */
  ort: string | null;
  start: Date;
  /** Saknas för en punkt i tiden; då räknas en timme. */
  slut: Date | null;
  /** Sökinriktning eller motsvarande kort etikett. */
  tagg: string | null;
  href: string | null;
};

/** Antas vara en timme lång när sluttid saknas. */
const slutTid = (h: Handelse) =>
  h.slut ?? new Date(h.start.getTime() + 3_600_000);

/** Minuter sedan midnatt i svensk tid. */
export function minuterPaDygnet(d: Date) {
  const [timmar, minuter] = toLocalInput(d).slice(11).split(":").map(Number);
  return timmar * 60 + minuter;
}

/* ------------------------------------------------------ Månadens rutnät */

/** Den första i månaden efter den som nyckeln ligger i. */
function forstaINastaManad(nyckel: string) {
  const ar = Number(nyckel.slice(0, 4));
  const manad = Number(nyckel.slice(5, 7));
  const nyttAr = manad === 12 ? ar + 1 : ar;
  const nyManad = manad === 12 ? 1 : manad + 1;
  return `${String(nyttAr).padStart(4, "0")}-${String(nyManad).padStart(2, "0")}-01`;
}

/** Den första i månaden som nyckeln ligger i. */
export const forstaIManaden = (nyckel: string) => `${nyckel.slice(0, 7)}-01`;

/**
 * Rutorna i månadsrutnätet: hela veckor med måndag först, så att
 * kolumnerna alltid står under rätt veckodag. Dagarna före och efter
 * månaden följer med men märks som utanför.
 */
export function manadsrutnat(nyckel: string) {
  const forsta = forstaIManaden(nyckel);
  const nasta = forstaINastaManad(forsta);
  const sista = addDaysKey(nasta, -1);

  const rutor: { nyckel: string; iManaden: boolean }[] = [];
  let dag = startOfWeekKey(forsta);
  // Kör tills månaden är slut och veckan är fylld – annars skulle sista
  // raden sakna sina sista rutor och kolumnerna glida.
  while (dag <= sista || rutor.length % 7 !== 0) {
    rutor.push({ nyckel: dag, iManaden: dag >= forsta && dag <= sista });
    dag = addDaysKey(dag, 1);
  }
  return rutor;
}

/** De sju dagarna i veckan som nyckeln ligger i. */
export function veckans(nyckel: string) {
  const mandag = startOfWeekKey(nyckel);
  return Array.from({ length: 7 }, (_, i) => addDaysKey(mandag, i));
}

/* ------------------------------------------------- Gruppering per dygn */

/**
 * Händelserna per dygn. En händelse som sträcker sig över flera dygn –
 * en satt otillgänglighet över en vecka, till exempel – hamnar på varje
 * dag den berör, annars syns den bara den dag den råkade börja.
 */
export function perDag(handelser: Handelse[], dagar: string[]) {
  const karta = new Map<string, Handelse[]>(dagar.map((d) => [d, []]));
  for (const h of handelser) {
    const fran = dateKey(h.start);
    const till = dateKey(slutTid(h));
    for (const dag of dagar) {
      if (dag >= fran && dag <= till) karta.get(dag)?.push(h);
    }
  }
  for (const lista of karta.values()) {
    lista.sort((a, b) => a.start.getTime() - b.start.getTime());
  }
  return karta;
}

/** Vilka slag som förekommer en dag – prickarna under datumet. */
export function slagenFor(handelser: Handelse[]): Slag[] {
  const ordning: Slag[] = ["uppdrag", "traning", "otillganglig"];
  return ordning.filter((slag) => handelser.some((h) => h.slag === slag));
}

/* -------------------------------------------------------- Veckans block */

/** Händelsens del av ett visst dygn, i minuter, klippt vid dygnsgränsen. */
export function dagsintervall(h: Handelse, dag: string) {
  const slut = slutTid(h);
  const fran = dateKey(h.start) < dag ? 0 : minuterPaDygnet(h.start);
  const till = dateKey(slut) > dag ? 1440 : minuterPaDygnet(slut);
  // Ett block måste synas även när det är kort; en kvart är minsta höjd.
  return { fran, till: Math.max(till, fran + 15) };
}

export type Spalt = { handelse: Handelse; spalt: number; antal: number };

/**
 * Delar in dagens händelser i spalter så att de som krockar hamnar
 * bredvid varandra i stället för ovanpå.
 *
 * Händelserna gås igenom i tidsordning och samlas i klungor som hänger
 * ihop; inom en klunga får varje händelse den första spalt som är ledig
 * vid dess starttid. Hela klungan delar sedan bredden lika, så att två
 * block som krockar blir hälften så breda var. Det är hela poängen med
 * veckovyn – månadens prickar döljer en dubbelbokning.
 */
export function spalter(handelser: Handelse[], dag: string): Spalt[] {
  const sorterade = [...handelser].sort(
    (a, b) =>
      dagsintervall(a, dag).fran - dagsintervall(b, dag).fran ||
      dagsintervall(b, dag).till - dagsintervall(a, dag).till,
  );

  const resultat: Spalt[] = [];
  let klunga: { handelse: Handelse; spalt: number }[] = [];
  let klungslut = -Infinity;

  const stangKlunga = () => {
    if (klunga.length === 0) return;
    const antal = Math.max(...klunga.map((x) => x.spalt)) + 1;
    for (const x of klunga) resultat.push({ ...x, antal });
    klunga = [];
    klungslut = -Infinity;
  };

  for (const handelse of sorterade) {
    const { fran, till } = dagsintervall(handelse, dag);
    // Börjar den efter att allt i klungan tagit slut är krocken över och
    // nästa klunga får använda hela bredden igen.
    if (fran >= klungslut) stangKlunga();

    const upptagna = new Set(
      klunga
        .filter((x) => dagsintervall(x.handelse, dag).till > fran)
        .map((x) => x.spalt),
    );
    let spalt = 0;
    while (upptagna.has(spalt)) spalt += 1;

    klunga.push({ handelse, spalt });
    klungslut = Math.max(klungslut, till);
  }
  stangKlunga();

  return resultat;
}

/**
 * Timmarna veckorutnätet ska visa.
 *
 * Fönstret utgår från en arbetsdag och växer bara när något faktiskt
 * ligger utanför – ett uppdrag klockan 22 ska synas, men ett dygn på
 * höjden gör alla andra block för låga för att läsa.
 */
export function timfonster(
  handelser: Handelse[],
  dagar: string[],
  minsta = { fran: 6, till: 19 },
) {
  let fran = minsta.fran;
  let till = minsta.till;
  for (const dag of dagar) {
    for (const h of handelser) {
      if (dateKey(h.start) > dag || dateKey(slutTid(h)) < dag) continue;
      const intervall = dagsintervall(h, dag);
      fran = Math.min(fran, Math.floor(intervall.fran / 60));
      till = Math.max(till, Math.ceil(intervall.till / 60));
    }
  }
  return { fran, till: Math.max(till, fran + 1) };
}
