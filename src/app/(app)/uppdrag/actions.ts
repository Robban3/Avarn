"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan, regionScope, teamScope } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { fromLocalInput, listaFranText, parseKoordinater } from "@/lib/format";
import { EVENT_KINDS, type EventKind } from "@/lib/domain";
import type { SessionUser } from "@/lib/session";
import { notify } from "@/lib/notify";

/** Server actions för uppdrag: skapa, tilldela och svara. */

const missionSchema = z.object({
  title: z.string().trim().min(1, "Ange en rubrik"),
  missionType: z.string().trim().min(1, "Ange uppdragstyp"),
  customerId: z.string().optional(),
  contactName: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  date: z.string().min(1, "Ange datum"),
  startTime: z.string().min(1, "Ange starttid"),
  endTime: z.string().optional(),
  address: z.string().trim().optional(),
  locality: z.string().trim().min(1, "Ange ort"),
  regionId: z.string().min(1, "Välj region"),
  disciplineId: z.string().optional(),
  meetingPoint: z.string().trim().max(200).optional(),
  parkingInfo: z.string().trim().max(400).optional(),
  missionArea: z.string().trim().max(200).optional(),
  equipment: z.string().trim().max(1000).optional(),
  koordinater: z.string().trim().max(60).optional(),
  specialInstructions: z.string().trim().max(4000).optional(),
});

/**
 * Fälten som är gemensamma för att skapa och rätta ett uppdrag. Tid och
 * koordinater tolkas här, så att båda vägarna behandlar dem likadant.
 */
function missionData(data: z.infer<typeof missionSchema>) {
  const startAt = fromLocalInput(`${data.date}T${data.startTime}`);
  let endAt = data.endTime
    ? fromLocalInput(`${data.date}T${data.endTime}`)
    : null;
  // Ett nattligt uppdrag slutar efter midnatt, som ett kvällspass.
  if (endAt && endAt <= startAt) {
    endAt = new Date(endAt.getTime() + 24 * 60 * 60 * 1000);
  }

  const punkt = parseKoordinater(data.koordinater ?? "");

  return {
    title: data.title,
    missionType: data.missionType,
    customerId: data.customerId || null,
    contactName: data.contactName || null,
    contactPhone: data.contactPhone || null,
    startAt,
    endAt,
    address: data.address || null,
    locality: data.locality,
    meetingPoint: data.meetingPoint || null,
    parkingInfo: data.parkingInfo || null,
    missionArea: data.missionArea || null,
    equipment: data.equipment || null,
    latitude: punkt?.lat ?? null,
    longitude: punkt?.lng ?? null,
    regionId: data.regionId,
    disciplineId: data.disciplineId || null,
    specialInstructions: data.specialInstructions || null,
  };
}

export type MissionFormState = { error?: string };

/** Uppdragsnumren börjar här, som i Avarns befintliga ärendeserie. */
const REFERENS_START = 2500;

/**
 * Nästa lediga uppdragsnummer: ett steg efter det högsta som finns.
 *
 * Numren jämförs som tal och inte som text – "UPP-10000" sorteras före
 * "UPP-9999" i bokstavsordning. Bara referenskolumnen hämtas.
 */
async function nastaReferens(steg: number) {
  const befintliga = await db.mission.findMany({ select: { reference: true } });
  const hogsta = befintliga.reduce((max, m) => {
    const nummer = Number(m.reference.replace(/^UPP-/, ""));
    return Number.isFinite(nummer) && nummer > max ? nummer : max;
  }, REFERENS_START - 1);
  return `UPP-${hogsta + 1 + steg}`;
}

/**
 * Skapar med ett löpnummer och gör om vid krock. Två samtidiga skapanden
 * kan få samma nummer; referensen är unik i databasen, så den ena får ett
 * nytt försök i stället för ett femhundrafel.
 */
async function skapaMedReferens<T>(skapa: (reference: string) => Promise<T>) {
  for (let forsok = 0; forsok < 5; forsok += 1) {
    try {
      return await skapa(await nastaReferens(forsok));
    } catch (error) {
      const kod = (error as { code?: string }).code;
      if (kod !== "P2002") throw error;
    }
  }
  throw new Error("Kunde inte tilldela ett uppdragsnummer. Försök igen.");
}

export async function createMission(
  _prev: MissionFormState,
  formData: FormData,
): Promise<MissionFormState> {
  const user = await requireUser();
  assertCan(user, "mission:create");

  const parsed = missionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  // Regionalt ansvarig får bara skapa uppdrag i sin egen region.
  const scope = regionScope(user);
  if (scope.regionId && scope.regionId !== data.regionId) {
    return { error: "Du kan bara lägga upp uppdrag i din egen region." };
  }

  // Klockslagen läses som svensk tid, precis som formuläret visade dem –
  // annars flyttar sig uppdraget en till två timmar varje gång det sparas.
  let falt: ReturnType<typeof missionData>;
  try {
    falt = missionData(data);
  } catch (error) {
    return { error: (error as Error).message };
  }

  // Löpnummer som är läsbart i fält och i rapporter. Numret räknades
  // tidigare fram ur antalet uppdrag, vilket gav samma referens åt två
  // samtidiga skapanden och återanvände ett upptaget nummer efter en
  // radering – referensen är unik i databasen, så det slutade i ett
  // ohanterat fel. Nu tas nästa nummer efter det högsta som finns, och
  // krockar vi ändå görs ett nytt försök.
  const mission = await skapaMedReferens((reference) =>
    db.mission.create({
      data: {
        reference,
        ...falt,
        status: "PLANNED",
        createdById: user.id,
      },
    }),
  );

  await audit({
    userId: user.id,
    action: "CREATE",
    entityType: "Mission",
    entityId: mission.id,
    detail: mission.reference,
  });

  revalidatePath("/uppdrag");
  redirect(`/uppdrag/${mission.id}`);
}

/**
 * Rättar ett befintligt uppdrag.
 *
 * Referensen står fast – den är uppdragets namn i fält och i rapporter –
 * och likaså statusen, som styrs av tilldelning och genomförande.
 */
export async function updateMission(
  _prev: MissionFormState,
  formData: FormData,
): Promise<MissionFormState> {
  const user = await requireUser();
  assertCan(user, "mission:create");

  const missionId = String(formData.get("missionId") ?? "");
  // Avgränsningen ligger i frågan, och svaret är detsamma vare sig
  // uppdraget saknas eller ligger utanför behörigheten.
  const existing = await db.mission.findFirst({
    where: { id: missionId, ...regionScope(user) },
    select: { id: true, reference: true },
  });
  if (!existing) return { error: "Uppdraget ligger utanför din behörighet." };

  const parsed = missionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }
  const data = parsed.data;

  const scope = regionScope(user);
  if (scope.regionId && scope.regionId !== data.regionId) {
    return { error: "Du kan bara flytta uppdrag inom din egen region." };
  }

  let falt: ReturnType<typeof missionData>;
  try {
    falt = missionData(data);
  } catch (error) {
    return { error: (error as Error).message };
  }

  await db.mission.update({ where: { id: existing.id }, data: falt });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Mission",
    entityId: existing.id,
    detail: existing.reference,
  });

  revalidatePath(`/uppdrag/${existing.id}`);
  revalidatePath(`/uppdrag/${existing.id}/detaljer`);
  revalidatePath("/uppdrag");
  redirect(`/uppdrag/${existing.id}`);
}

/**
 * Föraren markerar att uppdraget är påbörjat.
 *
 * Till skillnad från setMissionStatus, som ledningen använder, får den
 * här tryckas av den som faktiskt ska ut: kravet är en accepterad
 * tilldelning inom den egna behörigheten. Starttiden sparas på
 * tilldelningen och förifyller sedan rapportens "Påbörjat".
 */
export async function startMission(formData: FormData) {
  const user = await requireUser();

  const missionId = String(formData.get("missionId") ?? "");
  const assignment = await db.missionAssignment.findFirst({
    where: {
      missionId,
      status: "ACCEPTED",
      team: { AND: [teamScope(user), { handlerId: user.id }] },
    },
    include: { mission: { select: { id: true, status: true } } },
  });

  if (!assignment) {
    throw new Error("Du är inte tilldelad det här uppdraget.");
  }
  if (["COMPLETED", "CANCELLED"].includes(assignment.mission.status)) {
    throw new Error("Uppdraget är avslutat och kan inte startas.");
  }

  // Bara första gången: en andra tryckning ska inte flytta starttiden.
  if (!assignment.startedAt) {
    await db.missionAssignment.update({
      where: { id: assignment.id },
      data: { startedAt: new Date() },
    });
  }

  // Framåt, aldrig bakåt.
  if (["PLANNED", "ASSIGNED"].includes(assignment.mission.status)) {
    await db.mission.update({
      where: { id: assignment.mission.id },
      data: { status: "IN_PROGRESS" },
    });
  }

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Mission",
    entityId: assignment.mission.id,
    detail: "Uppdrag påbörjat",
  });

  revalidatePath(`/uppdrag/${missionId}`);
  revalidatePath(`/uppdrag/${missionId}/detaljer`);
  revalidatePath("/uppdrag");
  revalidatePath("/hem");

  // Vidare in i den operativa vyn: föraren tryckte start för att komma i
  // gång, inte för att stanna kvar på samma sida.
  redirect(`/uppdrag/${missionId}/pagaende`);
}

/**
 * Tilldelningen som hör till den inloggade föraren på ett pågående
 * uppdrag, med allt den operativa vyn ändrar.
 *
 * Alla handlingar i vyn går genom den här: kravet är att uppdraget är
 * ens eget, accepterat, påbörjat och inte avslutat. Ligger avgränsningen
 * i frågan kan inget id som skickas med i formuläret nå någon annans
 * uppdrag.
 */
async function egetPagaendeUppdrag(user: SessionUser, missionId: string) {
  const assignment = await db.missionAssignment.findFirst({
    where: {
      missionId,
      status: "ACCEPTED",
      startedAt: { not: null },
      endedAt: null,
      team: { AND: [teamScope(user), { handlerId: user.id }] },
    },
    select: {
      id: true,
      missionId: true,
      progressPercent: true,
      checklistDone: true,
    },
  });
  if (!assignment) {
    throw new Error("Du har inget pågående uppdrag här.");
  }
  return assignment;
}

/** Sidorna som visar ett pågående uppdrag, efter en ändring. */
function uppdateraPagaende(missionId: string) {
  revalidatePath(`/uppdrag/${missionId}/pagaende`);
  revalidatePath(`/uppdrag/${missionId}/detaljer`);
  revalidatePath(`/uppdrag/${missionId}`);
  revalidatePath("/hem");
}

/**
 * Registrerar en händelse under pågående uppdrag – en markering, ett
 * fynd, en avvikelse eller en notering.
 *
 * Ett tryck ska räcka. Texten är därför frivillig: hinner föraren inte
 * skriva något är tidpunkten och typen ändå kvar, och kan fyllas på i
 * rapporten efteråt.
 */
export async function registerMissionEvent(formData: FormData) {
  const user = await requireUser();
  const missionId = String(formData.get("missionId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!EVENT_KINDS.includes(kind as EventKind)) {
    throw new Error("Okänd händelsetyp.");
  }

  const assignment = await egetPagaendeUppdrag(user, missionId);

  await db.missionEvent.create({
    data: {
      assignmentId: assignment.id,
      kind,
      note: note.slice(0, 1000) || null,
      createdById: user.id,
    },
  });

  uppdateraPagaende(missionId);
}

/** Tar bort en felregistrerad händelse. */
export async function removeMissionEvent(formData: FormData) {
  const user = await requireUser();
  const missionId = String(formData.get("missionId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");

  const assignment = await egetPagaendeUppdrag(user, missionId);

  // Händelsen måste höra till den egna tilldelningen – annars skulle ett
  // främmande id kunna raderas genom att skickas med i formuläret.
  await db.missionEvent.deleteMany({
    where: { id: eventId, assignmentId: assignment.id },
  });

  uppdateraPagaende(missionId);
}

/** Bockar av eller ångrar en punkt i checklistan. */
export async function toggleChecklistItem(formData: FormData) {
  const user = await requireUser();
  const missionId = String(formData.get("missionId") ?? "");
  const punkt = String(formData.get("punkt") ?? "").trim();
  if (!punkt) return;

  const assignment = await egetPagaendeUppdrag(user, missionId);

  const avbockade = new Set(listaFranText(assignment.checklistDone));
  if (avbockade.has(punkt)) avbockade.delete(punkt);
  else avbockade.add(punkt);

  await db.missionAssignment.update({
    where: { id: assignment.id },
    data: { checklistDone: [...avbockade].join("\n") || null },
  });

  uppdateraPagaende(missionId);
}

/**
 * Ändrar hur stor del av området som är genomsökt.
 *
 * Steget kommer från knappen och andelen är förarens egen bedömning –
 * appen har inget sätt att mäta den, och ska inte låtsas att den har det.
 */
export async function setMissionProgress(formData: FormData) {
  const user = await requireUser();
  const missionId = String(formData.get("missionId") ?? "");
  const steg = Number(formData.get("steg") ?? 0);
  if (!Number.isFinite(steg)) return;

  const assignment = await egetPagaendeUppdrag(user, missionId);
  const nytt = Math.min(100, Math.max(0, assignment.progressPercent + steg));

  await db.missionAssignment.update({
    where: { id: assignment.id },
    data: { progressPercent: nytt },
  });

  uppdateraPagaende(missionId);
}

/**
 * Avslutar förarens arbete på plats och skickar vidare till rapporten.
 *
 * Uppdragets status rörs inte: den sätts till avslutat först när
 * rapporten är godkänd, och det är inte förarens beslut.
 */
export async function endMission(formData: FormData) {
  const user = await requireUser();
  const missionId = String(formData.get("missionId") ?? "");

  const assignment = await egetPagaendeUppdrag(user, missionId);

  await db.missionAssignment.update({
    where: { id: assignment.id },
    data: { endedAt: new Date() },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Mission",
    entityId: missionId,
    detail: "Uppdrag avslutat på plats",
  });

  uppdateraPagaende(missionId);
  redirect(`/rapporter/nytt?uppdrag=${missionId}`);
}

/** Tilldelar ett ekipage. Ekipaget måste ligga inom tilldelarens behörighet. */
export async function assignTeam(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "mission:assign");

  const missionId = String(formData.get("missionId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");

  const [mission, team] = await Promise.all([
    db.mission.findFirst({ where: { id: missionId, ...regionScope(user) } }),
    db.team.findFirst({
      where: { id: teamId, ...teamScope(user) },
      include: { dog: true, handler: true },
    }),
  ]);

  if (!mission) throw new Error("Uppdraget ligger utanför din behörighet.");
  if (!team) throw new Error("Ekipaget ligger utanför din behörighet.");
  if (["COMPLETED", "CANCELLED"].includes(mission.status)) {
    throw new Error("Uppdraget är avslutat och kan inte tilldelas.");
  }

  await db.missionAssignment.upsert({
    where: { missionId_teamId: { missionId: mission.id, teamId: team.id } },
    create: {
      missionId: mission.id,
      teamId: team.id,
      assignedById: user.id,
      status: "OFFERED",
    },
    update: { status: "OFFERED", respondedAt: null, assignedById: user.id },
  });

  // Bara framåt: ett pågående uppdrag ska inte falla tillbaka till
  // "Tilldelat" för att ytterligare ett ekipage kallas in.
  if (mission.status === "PLANNED") {
    await db.mission.update({
      where: { id: mission.id },
      data: { status: "ASSIGNED" },
    });
  }

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Mission",
    entityId: mission.id,
    detail: `Tilldelat ${team.dog.name} / ${team.handler.name}`,
  });

  await notify({
    userId: team.handlerId,
    type: "MISSION_ASSIGNED",
    title: `Nytt uppdrag: ${mission.title}`,
    body: `${mission.locality} · ${mission.reference}. Svara ja eller nej i uppdragsvyn.`,
    url: `/uppdrag/${mission.id}`,
  });

  revalidatePath(`/uppdrag/${mission.id}`);
  revalidatePath("/uppdrag");
}

/** Hundförarens svar på ett erbjudet uppdrag. */
export async function respondToAssignment(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "mission:respond");

  const assignmentId = String(formData.get("assignmentId") ?? "");
  const answer = String(formData.get("answer") ?? "");
  if (!["ACCEPTED", "DECLINED"].includes(answer)) return;

  const assignment = await db.missionAssignment.findFirst({
    where: { id: assignmentId, team: teamScope(user) },
    include: { mission: true, team: { include: { dog: true } } },
  });
  if (!assignment) throw new Error("Tilldelningen ligger utanför din behörighet.");
  // Ett svar hör till en tilldelning som fortfarande är öppen. Ett avslutat
  // eller inställt uppdrag går inte att tacka nej till i efterhand.
  if (assignment.status === "COMPLETED") {
    throw new Error("Uppdraget är redan avslutat.");
  }
  if (["COMPLETED", "CANCELLED"].includes(assignment.mission.status)) {
    throw new Error("Uppdraget är avslutat och går inte längre att svara på.");
  }

  await db.missionAssignment.update({
    where: { id: assignment.id },
    data: { status: answer, respondedAt: new Date() },
  });

  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "MissionAssignment",
    entityId: assignment.id,
    detail: answer === "ACCEPTED" ? "Accepterat" : "Avböjt",
  });

  await notify({
    userId: assignment.assignedById,
    type: "MISSION_ASSIGNED",
    title:
      answer === "ACCEPTED"
        ? `${user.name} accepterade ${assignment.mission.reference}`
        : `${user.name} avböjde ${assignment.mission.reference}`,
    body: `${assignment.mission.title} · ${assignment.team.dog.name}`,
    url: `/uppdrag/${assignment.missionId}`,
  });

  revalidatePath(`/uppdrag/${assignment.missionId}`);
  revalidatePath("/uppdrag");
  revalidatePath("/hem");
}

/** Markerar uppdraget som pågående eller avslutat. */
export async function setMissionStatus(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "mission:assign");

  const missionId = String(formData.get("missionId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["PLANNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
    return;
  }

  const mission = await db.mission.findFirst({
    where: { id: missionId, ...regionScope(user) },
  });
  if (!mission) throw new Error("Uppdraget ligger utanför din behörighet.");

  await db.mission.update({ where: { id: mission.id }, data: { status } });
  await audit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Mission",
    entityId: mission.id,
    detail: `Status ${status}`,
  });

  revalidatePath(`/uppdrag/${mission.id}`);
  revalidatePath("/uppdrag");
}
