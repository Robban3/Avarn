import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatKoordinater,
  formatKoordinatlista,
  formatStopwatch,
  fromLocalInput,
  listaFranText,
  monthsBack,
  parseKoordinater,
  parseKoordinatlista,
  startOfMonthLocal,
} from "./format";
import { addMonths, egetIntyg } from "./certifications";
import { valjNotiser } from "./notiser";
import { franHandelser } from "./handelser";
import { axelSteg, procentandelar } from "@/components/AdminCharts";

/**
 * Prov för de beräkningar som såg trovärdiga ut men räknade fel. Alla var
 * osynliga i gränssnittet: talen stämde inte, men de såg rimliga ut.
 */

describe("månadsgränser följer svensk tid", () => {
  it("lägger ett pass strax efter midnatt i rätt månad", () => {
    // 1 september 00:30 svensk tid är 31 augusti 22:30 UTC. Med gränsen
    // räknad i UTC hamnade passet i augustistapeln.
    const pass = fromLocalInput("2026-09-01T00:30");
    const manader = monthsBack(6, fromLocalInput("2026-09-15T12:00"));
    const september = manader.at(-1);

    expect(september?.label).toBe("sep");
    expect(pass >= september!.start).toBe(true);
    expect(pass < september!.end).toBe(true);
  });

  it("går över årsskiftet", () => {
    const manader = monthsBack(3, fromLocalInput("2026-01-15T12:00"));
    expect(manader.map((m) => m.label)).toEqual(["nov", "dec", "jan"]);
  });

  it("ger månadens första klockan noll i svensk tid", () => {
    expect(startOfMonthLocal(fromLocalInput("2026-07-15T12:00")).toISOString())
      .toBe("2026-06-30T22:00:00.000Z");
  });
});

describe("giltighetstid i månader", () => {
  it("spiller inte över till nästa månad", () => {
    // setMonth gav 3 mars för 31 januari plus en månad.
    expect(addMonths(new Date("2026-01-31T00:00:00Z"), 1).toISOString()).toBe(
      "2026-02-28T00:00:00.000Z",
    );
    expect(addMonths(new Date("2028-01-31T00:00:00Z"), 1).toISOString()).toBe(
      "2028-02-29T00:00:00.000Z",
    );
  });

  it("behåller dagen när månaden räcker till", () => {
    expect(addMonths(new Date("2026-03-15T00:00:00Z"), 24).toISOString()).toBe(
      "2028-03-15T00:00:00.000Z",
    );
  });
});

describe("procenttalen i ringdiagrammet", () => {
  it("summerar alltid till hundra", () => {
    for (const varden of [
      [1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [17, 17, 17, 49],
      [2, 3, 5, 7, 11],
    ]) {
      expect(procentandelar(varden).reduce((s, v) => s + v, 0)).toBe(100);
    }
  });

  it("ger noll för tomt underlag i stället för att dela med noll", () => {
    expect(procentandelar([0, 0])).toEqual([0, 0]);
  });
});

describe("linjediagrammets axel", () => {
  it("följer seriens storleksordning", () => {
    // Tidigare blev steget 10 för allt under 41, så en serie på 3–8 timmar
    // låg hoptryckt i understa femtedelen.
    expect(axelSteg(8) * 4).toBe(8);
    expect(axelSteg(3) * 4).toBe(4);
    expect(axelSteg(40) * 4).toBe(40);
    expect(axelSteg(180) * 4).toBe(200);
  });

  it("når alltid upp till seriens högsta värde", () => {
    for (let max = 1; max <= 500; max += 1) {
      expect(axelSteg(max) * 4).toBeGreaterThanOrEqual(max);
    }
  });
});

describe("urvalet till viktiga notiser", () => {
  const cert = (dagar: number, id: string) => ({
    id,
    text: id,
    href: "/certifikat",
    urgent: true,
    at: new Date(),
    ordning: dagar * 86_400_000,
  });
  const vantande = (id: string) => ({
    id,
    text: id,
    href: "/traning",
    urgent: false,
    at: new Date(),
    ordning: 0,
  });

  it("låter inte certifikaten tränga undan uppföljningen", () => {
    // Fyra certifikat i varningsfönstret och en öppen uppföljning: förut
    // klipptes listan osorterad och uppföljningen syntes aldrig.
    const valda = valjNotiser(
      [[cert(10, "c1"), cert(20, "c2"), cert(30, "c3"), cert(40, "c4")], [vantande("f1")]],
      4,
    );
    expect(valda.map((n) => n.id)).toContain("f1");
    expect(valda).toHaveLength(4);
  });

  it("sätter det som gått ut först", () => {
    const valda = valjNotiser([[cert(5, "snart"), cert(-3, "utgånget")], []], 2);
    expect(valda[0].id).toBe("utgånget");
  });

  it("fyller på från den ena kön när den andra är tom", () => {
    const valda = valjNotiser([[cert(1, "c1"), cert(2, "c2")], []], 4);
    expect(valda.map((n) => n.id)).toEqual(["c1", "c2"]);
  });
});

describe("ingen utfärdar intyg åt sig själv", () => {
  it("känner igen sig själv som mottagare", () => {
    expect(egetIntyg("u1", { kind: "user", id: "u1" }, null)).toBe(true);
    expect(egetIntyg("u1", { kind: "team", id: "t1" }, "u1")).toBe(true);
    expect(egetIntyg("u1", { kind: "dog", id: "d1" }, "u1")).toBe(true);
  });

  it("släpper igenom intyg åt någon annan", () => {
    expect(egetIntyg("u1", { kind: "user", id: "u2" }, null)).toBe(false);
    expect(egetIntyg("u1", { kind: "team", id: "t1" }, "u2")).toBe(false);
    expect(egetIntyg("u1", { kind: "dog", id: "d1" }, null)).toBe(false);
  });
});

describe("koordinater ur ett textfält", () => {
  it("läser formatet man kopierar från en karttjänst", () => {
    expect(parseKoordinater("59.6498, 17.9239")).toEqual({
      lat: 59.6498,
      lng: 17.9239,
    });
    // Mellanslag i stället för komma, och decimalkomma, förekommer båda.
    expect(parseKoordinater("59,6498 17,9239")).toEqual({
      lat: 59.6498,
      lng: 17.9239,
    });
    expect(parseKoordinater("-33.9 18.4")).toEqual({ lat: -33.9, lng: 18.4 });
  });

  it("skiljer tomt från skräp", () => {
    // Tomt betyder "ingen karta" och är inte ett fel.
    expect(parseKoordinater("")).toBeNull();
    expect(parseKoordinater("   ")).toBeNull();
    expect(() => parseKoordinater("Arlanda")).toThrow();
    expect(() => parseKoordinater("59.6498")).toThrow();
  });

  it("avvisar punkter som inte finns på jorden", () => {
    expect(() => parseKoordinater("91, 17")).toThrow(/[Ll]atitud/);
    expect(() => parseKoordinater("59, 181")).toThrow(/[Ll]ongitud/);
  });

  it("skriver tillbaka värdet så som fältet vill ha det", () => {
    expect(formatKoordinater(59.6498, 17.9239)).toBe("59.6498, 17.9239");
    expect(formatKoordinater(null, null)).toBe("");
    expect(formatKoordinater(59.6498, null)).toBe("");
  });
});

describe("utrustningslistan", () => {
  it("plockar bort tomma rader och mellanslag", () => {
    expect(listaFranText("Väst\n ID-kort \n\nFicklampa\n")).toEqual([
      "Väst",
      "ID-kort",
      "Ficklampa",
    ]);
    expect(listaFranText(null)).toEqual([]);
    expect(listaFranText("")).toEqual([]);
  });
});

describe("beräknad varaktighet", () => {
  it("skrivs som timmar och minuter", () => {
    expect(formatDuration(150)).toBe("2 h 30 min");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(0)).toBe("–");
  });
});

describe("händelser blir en förifylld rapport", () => {
  const kl = (timme: number, minut: number) =>
    fromLocalInput(`2026-09-03T${String(timme).padStart(2, "0")}:${String(minut).padStart(2, "0")}`);

  it("ger null när inget registrerats", () => {
    expect(franHandelser([])).toBeNull();
  });

  it("lägger varje typ i sitt fält", () => {
    const resultat = franHandelser([
      { kind: "MARKING", note: "Bagageband 7", at: kl(9, 42) },
      { kind: "FIND", note: "1 paket cannabis", at: kl(9, 50) },
      { kind: "DEVIATION", note: "Port 4 låst", at: kl(10, 5) },
      { kind: "NOTE", note: "Hunden arbetade lugnt", at: kl(10, 20) },
    ]);

    expect(resultat?.indications).toEqual([
      {
        location: "Bagageband 7",
        description: "Registrerad 09:42",
        outcome: "FIND",
        handedOverTo: "",
      },
    ]);
    expect(resultat?.findings).toBe("09:50 – 1 paket cannabis");
    expect(resultat?.deviations).toBe("10:05 – Port 4 låst");
    expect(resultat?.comment).toBe("10:20 – Hunden arbetade lugnt");
  });

  it("behåller klockslaget även för ett tryck utan text", () => {
    // Ett tryck ska räcka i fält; texten kan komma i rapporten efteråt.
    const resultat = franHandelser([
      { kind: "FIND", note: null, at: kl(11, 3) },
    ]);
    expect(resultat?.findings).toBe("11:03 – registrerat under uppdraget");
  });

  it("samlar noteringar och övriga händelser i tidsordning", () => {
    const resultat = franHandelser([
      { kind: "OTHER", note: "Polis på plats", at: kl(12, 0) },
      { kind: "NOTE", note: "Paus", at: kl(11, 0) },
    ]);
    expect(resultat?.comment).toBe("11:00 – Paus\n12:00 – Polis på plats");
  });
});

describe("varaktighet vid noll", () => {
  it("skiljer på ingen varaktighet och noll minuter", () => {
    // "–" betyder att uppgiften saknas. En klocka som just startat har
    // en varaktighet, och timern skriver därför ut den själv.
    expect(formatDuration(0)).toBe("–");
    expect(formatDuration(1)).toBe("1 min");
  });
});

describe("uppdragsområdets hörn", () => {
  it("läser en koordinat per rad", () => {
    expect(
      parseKoordinatlista("59.6510, 17.9210\n59.6512, 17.9268\n59.6488, 17.9280"),
    ).toEqual([
      { lat: 59.651, lng: 17.921 },
      { lat: 59.6512, lng: 17.9268 },
      { lat: 59.6488, lng: 17.928 },
    ]);
  });

  it("ger en tom lista för tomt fält", () => {
    expect(parseKoordinatlista("")).toEqual([]);
    expect(parseKoordinatlista(null)).toEqual([]);
  });

  it("pekar ut vilken rad som är fel", () => {
    // Utan radnumret får den som klistrat in fel bara en karta utan yta
    // och ingen förklaring.
    expect(() =>
      parseKoordinatlista("59.65, 17.92\nArlanda\n59.64, 17.93"),
    ).toThrow(/Rad 2/);
  });

  it("skriver tillbaka listan som fältet vill ha den", () => {
    const punkter = [
      { lat: 59.651, lng: 17.921 },
      { lat: 59.6512, lng: 17.9268 },
    ];
    expect(formatKoordinatlista(punkter)).toBe(
      "59.651, 17.921\n59.6512, 17.9268",
    );
    expect(parseKoordinatlista(formatKoordinatlista(punkter))).toEqual(punkter);
  });
});

describe("uppdragstiden som klocka", () => {
  it("har samma bredd hela tiden", () => {
    expect(formatStopwatch(0)).toBe("00:00:00");
    expect(formatStopwatch(7_000)).toBe("00:00:07");
    expect(formatStopwatch(42 * 60_000 + 18_000)).toBe("00:42:18");
    expect(formatStopwatch(3 * 3_600_000 + 5 * 60_000 + 9_000)).toBe(
      "03:05:09",
    );
  });

  it("går inte bakåt om klockorna skiljer sig", () => {
    // Serverns och telefonens klockor kan gå isär med någon sekund.
    expect(formatStopwatch(-5_000)).toBe("00:00:00");
  });
});
