import { NextResponse } from "next/server";
import { requirePanelUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { teamRows } from "@/lib/panel";
import { dateKey } from "@/lib/format";
import { certStatus } from "@/lib/certifications";
import { getSettings } from "@/lib/settings";

/**
 * Exporterar den vy man står i som CSV. Uttaget går genom samma
 * avgränsning som sidan, så filen kan aldrig innehålla mer än det
 * användaren redan ser – och det loggas, eftersom ett uttag av samlade
 * personuppgifter är värt att kunna följa upp.
 */

/** Citerar ett fält enligt CSV: dubbla citattecken, och citera alltid. */
function csv(varde: string | number | null | undefined) {
  const s = String(varde ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const user = await requirePanelUser();
  const url = new URL(request.url);
  const vy = url.searchParams.get("vy") ?? "ekipage";

  if (vy !== "ekipage") {
    return NextResponse.json({ fel: "Okänd vy" }, { status: 400 });
  }

  const { certWarningDays } = await getSettings();
  const rader = await teamRows(
    user,
    {
      regionId: url.searchParams.get("region") ?? undefined,
      disciplineId: url.searchParams.get("inriktning") ?? undefined,
      q: url.searchParams.get("sok") ?? undefined,
    },
    500,
  );

  const rubriker = [
    "Hundförare",
    "Hund",
    "Ras",
    "Sökinriktningar",
    "Region",
    "Status",
    "Senaste träning",
    "Certifikat att bevaka",
  ];

  const kropp = rader.map(({ team, senast }) =>
    [
      team.handler.name,
      team.dog.name,
      team.dog.breed,
      team.dog.disciplines.map((d) => d.discipline.name).join(", "),
      team.region.name,
      team.status === "ACTIVE" ? "Aktiv" : "Pausad",
      senast ? dateKey(senast) : "",
      team.certifications.filter(
        (c) => certStatus(c.expiresAt, certWarningDays) !== "VALID",
      )
        .length,
    ]
      .map(csv)
      .join(";"),
  );

  await audit({
    userId: user.id,
    action: "READ",
    entityType: "Team",
    entityId: "export",
    detail: `CSV-uttag, ${rader.length} ekipage`,
  });

  // Byte order mark så att Excel läser å, ä och ö rätt.
  const innehall = `﻿${[rubriker.map(csv).join(";"), ...kropp].join("\r\n")}\r\n`;

  return new NextResponse(innehall, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ekipage-${dateKey(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
