import { describe, expect, it } from "vitest";
import {
  dagsintervall,
  manadsrutnat,
  minuterPaDygnet,
  perDag,
  slagenFor,
  spalter,
  timfonster,
  veckans,
  type Handelse,
} from "./kalender";
import {
  addDaysKey,
  isoWeek,
  startOfWeekKey,
  weekdayIndex,
} from "./format";

/** Svensk tid; provdatumen ligger med flit på båda sidor om sommartiden. */
const tid = (text: string) => new Date(text);

function handelse(over: Partial<Handelse> & Pick<Handelse, "id">): Handelse {
  return {
    slag: "uppdrag",
    rubrik: "Uppdrag",
    ort: null,
    start: tid("2026-09-24T06:00:00Z"),
    slut: tid("2026-09-24T08:00:00Z"),
    tagg: null,
    href: null,
    ...over,
  };
}

describe("datumnycklar", () => {
  it("räknar dygn över sommartidsomställningen", () => {
    // Sista söndagen i mars 2026 är den 29:e – natten är 23 timmar lång.
    expect(addDaysKey("2026-03-28", 1)).toBe("2026-03-29");
    expect(addDaysKey("2026-03-29", 1)).toBe("2026-03-30");
    // Och sista söndagen i oktober, då natten är 25 timmar.
    expect(addDaysKey("2026-10-24", 3)).toBe("2026-10-27");
  });

  it("räknar över årsskiftet", () => {
    expect(addDaysKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysKey("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("har måndag som veckans första dag", () => {
    expect(weekdayIndex("2026-09-21")).toBe(0); // måndag
    expect(weekdayIndex("2026-09-27")).toBe(6); // söndag
    expect(startOfWeekKey("2026-09-24")).toBe("2026-09-21");
    expect(startOfWeekKey("2026-09-21")).toBe("2026-09-21");
  });

  it("ger ISO-veckonummer", () => {
    expect(isoWeek("2026-09-24")).toBe(39);
    // 1 januari 2027 är en fredag och hör till vecka 53 året innan.
    expect(isoWeek("2026-01-01")).toBe(1);
    expect(isoWeek("2026-12-31")).toBe(53);
  });
});

describe("manadsrutnat", () => {
  it("börjar på en måndag och fyller hela veckor", () => {
    const rutor = manadsrutnat("2026-09-24");
    expect(rutor.length % 7).toBe(0);
    expect(weekdayIndex(rutor[0].nyckel)).toBe(0);
    expect(weekdayIndex(rutor[rutor.length - 1].nyckel)).toBe(6);
  });

  it("täcker hela månaden och märker dagarna utanför", () => {
    const rutor = manadsrutnat("2026-09-01");
    const iManaden = rutor.filter((r) => r.iManaden).map((r) => r.nyckel);
    expect(iManaden[0]).toBe("2026-09-01");
    expect(iManaden.at(-1)).toBe("2026-09-30");
    expect(iManaden).toHaveLength(30);
    // September 2026 börjar på en tisdag, så måndagen den 31 augusti följer med.
    expect(rutor[0]).toEqual({ nyckel: "2026-08-31", iManaden: false });
  });

  it("klarar februari på ett skottår", () => {
    const iManaden = manadsrutnat("2028-02-10").filter((r) => r.iManaden);
    expect(iManaden).toHaveLength(29);
  });

  it("klarar december, där nästa månad ligger nästa år", () => {
    const iManaden = manadsrutnat("2026-12-05").filter((r) => r.iManaden);
    expect(iManaden.at(-1)?.nyckel).toBe("2026-12-31");
  });
});

describe("veckans", () => {
  it("ger sju dagar från måndag", () => {
    expect(veckans("2026-09-24")).toEqual([
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
    ]);
  });
});

describe("perDag", () => {
  const dagar = veckans("2026-09-24");

  it("lägger händelsen på sin dag", () => {
    const karta = perDag([handelse({ id: "a" })], dagar);
    expect(karta.get("2026-09-24")).toHaveLength(1);
    expect(karta.get("2026-09-23")).toHaveLength(0);
  });

  it("lägger en flerdygnspost på varje dag den berör", () => {
    const semester = handelse({
      id: "s",
      slag: "otillganglig",
      start: tid("2026-09-22T00:00:00Z"),
      slut: tid("2026-09-25T00:00:00Z"),
    });
    const karta = perDag([semester], dagar);
    const berorda = dagar.filter((d) => (karta.get(d) ?? []).length > 0);
    expect(berorda).toEqual([
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
    ]);
  });

  it("sorterar dagens poster i tidsordning", () => {
    const karta = perDag(
      [
        handelse({ id: "sen", start: tid("2026-09-24T14:00:00Z") }),
        handelse({ id: "tidig", start: tid("2026-09-24T06:00:00Z") }),
      ],
      dagar,
    );
    expect(karta.get("2026-09-24")?.map((h) => h.id)).toEqual(["tidig", "sen"]);
  });
});

describe("slagenFor", () => {
  it("ger ett slag per förekommande sort, i fast ordning", () => {
    expect(
      slagenFor([
        handelse({ id: "a", slag: "traning" }),
        handelse({ id: "b", slag: "uppdrag" }),
        handelse({ id: "c", slag: "uppdrag" }),
      ]),
    ).toEqual(["uppdrag", "traning"]);
  });

  it("ger tom lista för en tom dag", () => {
    expect(slagenFor([])).toEqual([]);
  });
});

describe("dagsintervall", () => {
  it("räknar minuter i svensk tid", () => {
    // 06:00 UTC är 08:00 svensk sommartid.
    const h = handelse({ id: "a" });
    expect(dagsintervall(h, "2026-09-24")).toEqual({
      fran: 8 * 60,
      till: 10 * 60,
    });
  });

  it("klipper vid dygnsgränsen", () => {
    const h = handelse({
      id: "a",
      start: tid("2026-09-23T20:00:00Z"), // 22:00 svensk tid
      slut: tid("2026-09-24T04:00:00Z"), // 06:00 dagen efter
    });
    expect(dagsintervall(h, "2026-09-23")).toEqual({ fran: 22 * 60, till: 1440 });
    expect(dagsintervall(h, "2026-09-24")).toEqual({ fran: 0, till: 6 * 60 });
  });

  it("ger en post utan sluttid en timme", () => {
    const h = handelse({ id: "a", slut: null });
    const { fran, till } = dagsintervall(h, "2026-09-24");
    expect(till - fran).toBe(60);
  });

  it("ger ett mycket kort block en synlig höjd", () => {
    const h = handelse({
      id: "a",
      start: tid("2026-09-24T06:00:00Z"),
      slut: tid("2026-09-24T06:02:00Z"),
    });
    const { fran, till } = dagsintervall(h, "2026-09-24");
    expect(till - fran).toBe(15);
  });
});

describe("spalter", () => {
  const dag = "2026-09-24";

  it("ger en ensam post hela bredden", () => {
    const rader = spalter([handelse({ id: "a" })], dag);
    expect(rader).toEqual([
      { handelse: expect.objectContaining({ id: "a" }), spalt: 0, antal: 1 },
    ]);
  });

  it("lägger två som krockar sida vid sida", () => {
    const rader = spalter(
      [
        handelse({
          id: "a",
          start: tid("2026-09-24T11:00:00Z"),
          slut: tid("2026-09-24T13:00:00Z"),
        }),
        handelse({
          id: "b",
          start: tid("2026-09-24T11:30:00Z"),
          slut: tid("2026-09-24T13:30:00Z"),
        }),
      ],
      dag,
    );
    expect(rader.map((r) => [r.handelse.id, r.spalt, r.antal])).toEqual([
      ["a", 0, 2],
      ["b", 1, 2],
    ]);
  });

  it("låter två som inte krockar få hela bredden var", () => {
    const rader = spalter(
      [
        handelse({
          id: "a",
          start: tid("2026-09-24T06:00:00Z"),
          slut: tid("2026-09-24T08:00:00Z"),
        }),
        handelse({
          id: "b",
          start: tid("2026-09-24T09:00:00Z"),
          slut: tid("2026-09-24T11:00:00Z"),
        }),
      ],
      dag,
    );
    expect(rader.every((r) => r.antal === 1)).toBe(true);
  });

  it("återanvänder en spalt som blivit ledig", () => {
    // A och B krockar; C börjar efter A men krockar med B och ska då ta
    // A:s spalt i stället för en tredje.
    const rader = spalter(
      [
        handelse({
          id: "a",
          start: tid("2026-09-24T06:00:00Z"),
          slut: tid("2026-09-24T08:00:00Z"),
        }),
        handelse({
          id: "b",
          start: tid("2026-09-24T07:00:00Z"),
          slut: tid("2026-09-24T11:00:00Z"),
        }),
        handelse({
          id: "c",
          start: tid("2026-09-24T08:30:00Z"),
          slut: tid("2026-09-24T10:00:00Z"),
        }),
      ],
      dag,
    );
    const spalt = Object.fromEntries(
      rader.map((r) => [r.handelse.id, r.spalt]),
    );
    expect(spalt.a).toBe(0);
    expect(spalt.b).toBe(1);
    expect(spalt.c).toBe(0);
    expect(rader.every((r) => r.antal === 2)).toBe(true);
  });

  it("klarar tre samtidiga", () => {
    const rader = spalter(
      ["a", "b", "c"].map((id) =>
        handelse({
          id,
          start: tid("2026-09-24T06:00:00Z"),
          slut: tid("2026-09-24T09:00:00Z"),
        }),
      ),
      dag,
    );
    expect(rader.map((r) => r.spalt).sort()).toEqual([0, 1, 2]);
    expect(rader.every((r) => r.antal === 3)).toBe(true);
  });

  it("ger tom lista för en tom dag", () => {
    expect(spalter([], dag)).toEqual([]);
  });
});

describe("timfonster", () => {
  const dagar = veckans("2026-09-24");

  it("visar en arbetsdag när inget ligger utanför", () => {
    expect(timfonster([handelse({ id: "a" })], dagar)).toEqual({
      fran: 6,
      till: 19,
    });
  });

  it("växer när något ligger utanför", () => {
    const sent = handelse({
      id: "a",
      start: tid("2026-09-24T19:00:00Z"), // 21:00 svensk tid
      slut: tid("2026-09-24T21:00:00Z"), // 23:00
    });
    expect(timfonster([sent], dagar)).toEqual({ fran: 6, till: 23 });
  });

  it("räknar bara dagar som visas", () => {
    const annanVecka = handelse({
      id: "a",
      start: tid("2026-10-24T19:00:00Z"),
      slut: tid("2026-10-24T21:00:00Z"),
    });
    expect(timfonster([annanVecka], dagar)).toEqual({ fran: 6, till: 19 });
  });
});

describe("minuterPaDygnet", () => {
  it("räknar i svensk tid, inte i UTC", () => {
    // Vintertid: UTC+1.
    expect(minuterPaDygnet(tid("2026-01-15T07:00:00Z"))).toBe(8 * 60);
    // Sommartid: UTC+2.
    expect(minuterPaDygnet(tid("2026-07-15T07:00:00Z"))).toBe(9 * 60);
  });
});

describe("timfonster och otillgänglighet", () => {
  const dagar = veckans("2026-09-24");

  it("låter inte ett dygnslångt block spränga fönstret", () => {
    // Otillgänglighet sätts i hela dygn. Räknades den in blev fönstret
    // midnatt–midnatt, och veckans uppdrag klämdes ihop till streck.
    const semester = handelse({
      id: "s",
      slag: "otillganglig",
      start: tid("2026-09-21T00:00:00Z"),
      slut: tid("2026-09-28T00:00:00Z"),
    });
    expect(timfonster([semester], dagar)).toEqual({ fran: 6, till: 19 });
  });

  it("men ett uppdrag utanför arbetsdagen vidgar det fortfarande", () => {
    const sent = handelse({
      id: "u",
      start: tid("2026-09-24T19:00:00Z"),
      slut: tid("2026-09-24T21:00:00Z"),
    });
    expect(timfonster([sent], dagar)).toEqual({ fran: 6, till: 23 });
  });
});
