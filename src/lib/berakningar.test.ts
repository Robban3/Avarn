import { describe, expect, it } from "vitest";
import { fromLocalInput, monthsBack, startOfMonthLocal } from "./format";
import { addMonths, egetIntyg } from "./certifications";
import { valjNotiser } from "./notiser";
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
