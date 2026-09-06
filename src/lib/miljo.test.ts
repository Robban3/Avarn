import { describe, expect, it } from "vitest";
import { _stadat as stadat } from "./miljo";

/**
 * Städningen av miljövärden.
 *
 * Finns för att .env skriver värden inom citattecken, och det är den filen
 * man kopierar ifrån när en hemlighet ska sättas någon annanstans. Ett
 * citattecken som följer med gör anslutningssträngen otolkbar, och felet
 * pekar inte på orsaken.
 */
describe("stadat", () => {
  it("tar bort omslutande dubbla citattecken", () => {
    expect(stadat('"postgresql://a:b@c:5432/d"')).toBe(
      "postgresql://a:b@c:5432/d",
    );
  });

  it("tar bort omslutande apostrofer", () => {
    expect(stadat("'hemlighet'")).toBe("hemlighet");
  });

  it("klipper blanktecken i båda ändar", () => {
    expect(stadat("  hemlighet \n")).toBe("hemlighet");
  });

  it("klipper blanktecken utanför citattecknen", () => {
    expect(stadat('  "hemlighet"  ')).toBe("hemlighet");
  });

  it("lämnar ett värde utan omslag orört", () => {
    expect(stadat("postgresql://a:b@c:5432/d")).toBe(
      "postgresql://a:b@c:5432/d",
    );
  });

  it("rör inte ett ensamt citattecken i ena änden", () => {
    expect(stadat('"halv')).toBe('"halv');
    expect(stadat("halv'")).toBe("halv'");
  });

  it("rör inte olika tecken i ändarna", () => {
    expect(stadat("\"blandat'")).toBe("\"blandat'");
  });

  it("tar bara ett par", () => {
    expect(stadat('""dubbelt""')).toBe('"dubbelt"');
  });

  it("klarar tomma och enteckensvärden", () => {
    expect(stadat("")).toBe("");
    expect(stadat('"')).toBe('"');
  });
});
