import { describe, expect, it } from "vitest";
import {
  can,
  assertCan,
  AccessDeniedError,
  teamScope,
  regionScope,
  seesAllRegions,
  canEditSession,
  canEditReport,
} from "./authz";
import { ROLES } from "./domain";
import type { SessionUser } from "./session";

const user = (role: SessionUser["role"], overrides: Partial<SessionUser> = {}): SessionUser => ({
  id: "u1",
  name: "Test Testsson",
  email: "test@avarn.se",
  role,
  regionId: "r-ost",
  ...overrides,
});

describe("can – rollens behörigheter", () => {
  it("låter hundföraren rapportera träning och svara på uppdrag", () => {
    const handler = user(ROLES.HANDLER);
    expect(can(handler, "session:create")).toBe(true);
    expect(can(handler, "mission:respond")).toBe(true);
    expect(can(handler, "report:create")).toBe(true);
  });

  it("nekar hundföraren att godkänna, tilldela eller se statistik", () => {
    const handler = user(ROLES.HANDLER);
    expect(can(handler, "session:approve")).toBe(false);
    expect(can(handler, "mission:assign")).toBe(false);
    expect(can(handler, "stats:view")).toBe(false);
    expect(can(handler, "instructor:view")).toBe(false);
    expect(can(handler, "admin:manage")).toBe(false);
  });

  it("ger instruktören granskning men inte uppdragstilldelning", () => {
    const instructor = user(ROLES.INSTRUCTOR);
    expect(can(instructor, "session:approve")).toBe(true);
    expect(can(instructor, "plan:manage")).toBe(true);
    expect(can(instructor, "instructor:view")).toBe(true);
    expect(can(instructor, "mission:assign")).toBe(false);
    expect(can(instructor, "mission:create")).toBe(false);
    expect(can(instructor, "stats:view")).toBe(false);
  });

  it("ger regionalt ansvarig uppdrag och statistik men inte administration", () => {
    const regional = user(ROLES.REGIONAL_MANAGER);
    expect(can(regional, "mission:create")).toBe(true);
    expect(can(regional, "mission:assign")).toBe(true);
    expect(can(regional, "stats:view")).toBe(true);
    expect(can(regional, "admin:manage")).toBe(false);
  });

  it("ger endast administratören användarhantering", () => {
    expect(can(user(ROLES.ADMIN), "admin:manage")).toBe(true);
    expect(can(user(ROLES.NATIONAL_MANAGER), "admin:manage")).toBe(false);
  });

  it("assertCan kastar för otillåten handling", () => {
    expect(() => assertCan(user(ROLES.HANDLER), "mission:assign")).toThrow(
      AccessDeniedError,
    );
    expect(() => assertCan(user(ROLES.ADMIN), "mission:assign")).not.toThrow();
  });
});

describe("teamScope – vilka ekipage som syns", () => {
  it("begränsar hundföraren till egna ekipage", () => {
    expect(teamScope(user(ROLES.HANDLER))).toEqual({ handlerId: "u1" });
  });

  it("begränsar instruktören till tilldelade ekipage", () => {
    expect(teamScope(user(ROLES.INSTRUCTOR))).toEqual({
      instructorAssignments: { some: { instructorId: "u1" } },
    });
  });

  it("begränsar regionalt ansvarig till egen region", () => {
    expect(teamScope(user(ROLES.REGIONAL_MANAGER))).toEqual({
      regionId: "r-ost",
    });
  });

  it("ger regionalt ansvarig utan region ingen träff alls", () => {
    const scope = teamScope(user(ROLES.REGIONAL_MANAGER, { regionId: null }));
    expect(scope).toEqual({ regionId: "__ingen_region__" });
  });

  it("låter nationellt ansvarig och administratör se allt", () => {
    expect(teamScope(user(ROLES.NATIONAL_MANAGER))).toEqual({});
    expect(teamScope(user(ROLES.ADMIN))).toEqual({});
  });

  it("ger okänd roll ingen åtkomst", () => {
    const scope = teamScope(user("OKAND_ROLL" as SessionUser["role"]));
    expect(scope).toEqual({ id: "__ingen_atkomst__" });
  });
});

describe("regionScope", () => {
  it("filtrerar på region för regionalt ansvarig", () => {
    expect(regionScope(user(ROLES.REGIONAL_MANAGER))).toEqual({
      regionId: "r-ost",
    });
  });

  it("lämnar filtret öppet för nationell nivå", () => {
    expect(regionScope(user(ROLES.NATIONAL_MANAGER))).toEqual({});
    expect(seesAllRegions(user(ROLES.NATIONAL_MANAGER))).toBe(true);
    expect(seesAllRegions(user(ROLES.REGIONAL_MANAGER))).toBe(false);
  });
});

describe("äganderätt till egna inlägg", () => {
  it("låter föraren redigera sitt eget pass fram till godkännande", () => {
    const handler = user(ROLES.HANDLER);
    expect(
      canEditSession(handler, { createdById: "u1", status: "DRAFT" }),
    ).toBe(true);
    expect(
      canEditSession(handler, { createdById: "u1", status: "SUBMITTED" }),
    ).toBe(true);
    expect(
      canEditSession(handler, { createdById: "u1", status: "APPROVED" }),
    ).toBe(false);
  });

  it("hindrar redigering av någon annans pass", () => {
    expect(
      canEditSession(user(ROLES.HANDLER), {
        createdById: "annan",
        status: "DRAFT",
      }),
    ).toBe(false);
    expect(
      canEditSession(user(ROLES.INSTRUCTOR), {
        createdById: "annan",
        status: "DRAFT",
      }),
    ).toBe(false);
  });

  it("tillämpar samma regel på rapporter", () => {
    expect(
      canEditReport(user(ROLES.HANDLER), { authorId: "u1", status: "DRAFT" }),
    ).toBe(true);
    expect(
      canEditReport(user(ROLES.HANDLER), { authorId: "u1", status: "APPROVED" }),
    ).toBe(false);
    expect(
      canEditReport(user(ROLES.REGIONAL_MANAGER), {
        authorId: "annan",
        status: "DRAFT",
      }),
    ).toBe(false);
  });

  it("låter en rättelse ske ända fram till godkännandet", () => {
    // Ett inskickat pass ska gå att rätta, och en begärd komplettering
    // vore meningslös om föraren inte kom åt formuläret igen.
    const forare = user(ROLES.HANDLER);
    for (const status of ["DRAFT", "SUBMITTED", "CHANGES_REQUESTED"]) {
      expect(canEditSession(forare, { createdById: "u1", status })).toBe(true);
      expect(canEditReport(forare, { authorId: "u1", status })).toBe(true);
    }
    expect(
      canEditReport(user(ROLES.HANDLER), {
        authorId: "annan",
        status: "SUBMITTED",
      }),
    ).toBe(false);
  });
});
