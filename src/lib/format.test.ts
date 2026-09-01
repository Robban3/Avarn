import { describe, expect, it } from "vitest";
import { dateKey, fromLocalInput, toLocalInput } from "./format";

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
