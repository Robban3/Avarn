import { describe, expect, it } from "vitest";
import {
  dateKey,
  daysUntil,
  formatRelative,
  fromLocalInput,
  toLocalInput,
} from "./format";
import { certStatus } from "./certifications";

/**
 * Klockslag skrivs in i svensk tid och visas i svensk tid. Servern kör i
 * UTC, så omvandlingen åt båda hållen måste gå genom tidszonen – annars
 * flyttar sig ett pass varje gång det sparas om.
 */
describe("tid mellan formulär och databas", () => {
  it("läser klockslaget som svensk tid, inte serverns", () => {
    // Sommartid: Sverige ligger två timmar före UTC.
    expect(fromLocalInput("2026-07-15T08:00").toISOString()).toBe(
      "2026-07-15T06:00:00.000Z",
    );
    // Vintertid: en timme före.
    expect(fromLocalInput("2026-01-15T08:00").toISOString()).toBe(
      "2026-01-15T07:00:00.000Z",
    );
  });

  it("ger tillbaka samma klockslag som skrevs in", () => {
    for (const värde of [
      "2026-01-15T08:00",
      "2026-07-15T22:45",
      "2026-03-29T04:30", // dygnet då klockan ställs fram
      "2026-10-25T04:30", // dygnet då den ställs tillbaka
      "2026-12-31T23:59",
    ]) {
      expect(toLocalInput(fromLocalInput(värde))).toBe(värde);
    }
  });

  it("grupperar på svenskt datum, inte på UTC-datum", () => {
    // 22:30 svensk tid den 1 september är 20:30 UTC samma dag …
    expect(dateKey(fromLocalInput("2026-09-01T22:30"))).toBe("2026-09-01");
    // … medan 00:30 svensk tid tillhör den 2:a fast UTC säger den 1:a.
    expect(dateKey(fromLocalInput("2026-09-02T00:30"))).toBe("2026-09-02");
  });

  it("avvisar skräp", () => {
    expect(() => fromLocalInput("")).toThrow();
    expect(() => fromLocalInput("inte ett datum")).toThrow();
  });
});

/**
 * Dygnsräkning. De här var trasiga på ett sätt som är svårt att se med
 * ögat: ett certifikat som nyss gått ut räknades som "går snart ut",
 * eftersom Math.ceil gav -0 och -0 < 0 är falskt.
 */
describe("daysUntil räknar kalenderdygn i svensk tid", () => {
  const nu = fromLocalInput("2026-06-15T12:00");

  it("ger negativt för något som redan gått ut", () => {
    // Igår kväll – tidigare blev det -0 och lästes som "inte utgånget".
    expect(daysUntil(fromLocalInput("2026-06-14T22:00"), nu)).toBe(-1);
    expect(daysUntil(fromLocalInput("2026-06-15T11:59"), nu)).toBe(0);
  });

  it("räknar dygn, inte varaktighet", () => {
    // Imorgon är imorgon oavsett klockslag.
    expect(daysUntil(fromLocalInput("2026-06-16T07:00"), nu)).toBe(1);
    expect(daysUntil(fromLocalInput("2026-06-16T23:00"), nu)).toBe(1);
    expect(daysUntil(fromLocalInput("2026-06-30T08:00"), nu)).toBe(15);
  });

  it("byter dygn vid svensk midnatt, inte serverns", () => {
    // 00:30 svensk tid är 22:30 UTC dagen innan.
    const strax = fromLocalInput("2026-06-15T00:30");
    expect(daysUntil(strax, nu)).toBe(0);
    expect(formatRelative(strax, nu)).toMatch(/^Idag/);
  });
});

describe("certStatus följer dygnsräkningen", () => {
  const nu = fromLocalInput("2026-06-15T12:00");

  it("kallar ett utgånget certifikat utgånget", () => {
    expect(certStatus(fromLocalInput("2026-06-14T22:00"), 60, nu)).toBe(
      "EXPIRED",
    );
  });

  it("respekterar den inställda varningsgränsen", () => {
    const om40 = fromLocalInput("2026-07-25T12:00");
    expect(certStatus(om40, 60, nu)).toBe("EXPIRING");
    expect(certStatus(om40, 30, nu)).toBe("VALID");
  });
});
