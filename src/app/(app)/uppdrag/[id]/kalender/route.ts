import { requireUser } from "@/lib/auth";
import { missionForUser } from "@/lib/queries";
import { audit } from "@/lib/audit";

/**
 * Uppdraget som en kalenderfil.
 *
 * "Lägg till i kalender" ska göra något på riktigt. En .ics-fil öppnas av
 * telefonens kalender utan att appen behöver be om behörighet, och funkar
 * likadant på iOS och Android.
 *
 * Avgränsningen är samma som uppdragssidans – filen kan aldrig innehålla
 * ett uppdrag användaren inte redan får se.
 */

/** Tidpunkt i UTC som iCalendar vill ha den: 20260903T060000Z. */
const stampa = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");

/**
 * Radbryter och undviker tecken som annars bryter formatet. Semikolon,
 * komma och omvänt snedstreck måste föregås av ett snedstreck, och nya
 * rader skrivs som \n.
 */
const text = (varde: string) =>
  varde.replace(/\\/g, "\\\\").replace(/[;,]/g, (t) => `\\${t}`).replace(/\n/g, "\\n");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requireUser();
  const mission = await missionForUser(user, id);

  if (!mission) {
    return new Response("Uppdraget finns inte.", { status: 404 });
  }

  await audit({
    userId: user.id,
    action: "READ",
    entityType: "Mission",
    entityId: mission.id,
    detail: "Kalenderfil",
  });

  const slut =
    mission.endAt ?? new Date(mission.startAt.getTime() + 2 * 60 * 60 * 1000);
  const plats = [mission.address, mission.locality].filter(Boolean).join(", ");
  const beskrivning = [
    `Uppdragstyp: ${mission.missionType}`,
    mission.discipline ? `Sökinriktning: ${mission.discipline.name}` : null,
    mission.customer ? `Kund: ${mission.customer.name}` : null,
    mission.meetingPoint ? `Mötesplats: ${mission.meetingPoint}` : null,
    mission.contactName
      ? `Kontakt: ${mission.contactName}${mission.contactPhone ? ` ${mission.contactPhone}` : ""}`
      : null,
    mission.specialInstructions,
  ]
    .filter(Boolean)
    .join("\n");

  const rader = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Avarn Security//Hundtjanst//SV",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${mission.id}@avarn-hundtjanst`,
    `DTSTAMP:${stampa(new Date())}`,
    `DTSTART:${stampa(mission.startAt)}`,
    `DTEND:${stampa(slut)}`,
    `SUMMARY:${text(`${mission.reference} ${mission.title}`)}`,
    plats ? `LOCATION:${text(plats)}` : null,
    beskrivning ? `DESCRIPTION:${text(beskrivning)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new Response(`${rader.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${mission.reference}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
