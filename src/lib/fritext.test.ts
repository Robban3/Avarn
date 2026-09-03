import { describe, expect, it } from "vitest";
import { bokstavligt } from "./fritext";

/**
 * Fritexten hamnar i ett LIKE, där % och _ är jokertecken. En sökning på
 * "%" skulle annars träffa allt, och "_o_a" hitta Nova.
 */
describe("bokstavligt", () => {
  it("gör jokertecknen bokstavliga", () => {
    expect(bokstavligt("%")).toBe("\\%");
    expect(bokstavligt("_o_a")).toBe("\\_o\\_a");
    expect(bokstavligt("100%_klart")).toBe("100\\%\\_klart");
  });

  it("escapar snedstrecket självt först", () => {
    // Annars hade "\%" blivit "\\%" – ett bokstavligt snedstreck följt
    // av ett jokertecken, i stället för ett bokstavligt procenttecken.
    expect(bokstavligt("\\")).toBe("\\\\");
    expect(bokstavligt("\\%")).toBe("\\\\\\%");
  });

  it("lämnar vanlig text i fred", () => {
    expect(bokstavligt("Nova")).toBe("Nova");
    expect(bokstavligt("UPP-2451")).toBe("UPP-2451");
    expect(bokstavligt("Områdessök – Skog")).toBe("Områdessök – Skog");
  });
});
