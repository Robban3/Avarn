/**
 * Tillåtna värden för de statusfält som lagras som String i databasen
 * (SQLite saknar enum). Etiketterna används rakt av i gränssnittet.
 */

export const ROLES = {
  HANDLER: "HANDLER",
  INSTRUCTOR: "INSTRUCTOR",
  REGIONAL_MANAGER: "REGIONAL_MANAGER",
  NATIONAL_MANAGER: "NATIONAL_MANAGER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  HANDLER: "Hundförare",
  INSTRUCTOR: "Instruktör",
  REGIONAL_MANAGER: "Regionalt ansvarig",
  NATIONAL_MANAGER: "Nationellt ansvarig",
  ADMIN: "Administratör",
};

export const ALL_ROLES = Object.values(ROLES);

/** Roller som ser hela eller delar av flera ekipage. */
export const LEADERSHIP_ROLES: Role[] = [
  ROLES.REGIONAL_MANAGER,
  ROLES.NATIONAL_MANAGER,
  ROLES.ADMIN,
];

export const OVERSIGHT_ROLES: Role[] = [
  ROLES.INSTRUCTOR,
  ...LEADERSHIP_ROLES,
];

// ------------------------------------------------------------------ Statusar

export const DOG_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktiv",
  RESTING: "Vilande",
  RETIRED: "Pensionerad",
};

export const TEAM_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktivt",
  PAUSED: "Pausat",
  ENDED: "Avslutat",
};

export const SESSION_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
} as const;

export const SESSION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Utkast",
  SUBMITTED: "Inskickad",
  APPROVED: "Godkänt",
  CHANGES_REQUESTED: "Kompletteras",
};

export const MISSION_STATUS = {
  PLANNED: "PLANNED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const MISSION_STATUS_LABELS: Record<string, string> = {
  PLANNED: "Planerat",
  ASSIGNED: "Tilldelat",
  IN_PROGRESS: "Pågående",
  COMPLETED: "Avslutat",
  CANCELLED: "Inställt",
};

/**
 * Färgton för uppdragets status.
 *
 * Låg tidigare i tre kopior – uppdragslistan, uppdragssidan och panelen –
 * som sa olika saker om samma status. Ett tilldelat uppdrag var turkost i
 * listan och grått på sidan.
 */
export function missionTone(status: string) {
  if (status === "COMPLETED") return "ok" as const;
  if (status === "CANCELLED") return "danger" as const;
  if (status === "IN_PROGRESS") return "brand" as const;
  if (status === "ASSIGNED") return "brand" as const;
  return "neutral" as const;
}

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  OFFERED: "Erbjudet",
  ACCEPTED: "Accepterat",
  DECLINED: "Avböjt",
  COMPLETED: "Genomfört",
};

/** Färgton för tilldelningens status, med samma logik som uppdragets. */
export function assignmentTone(status: string) {
  if (status === "ACCEPTED") return "ok" as const;
  if (status === "DECLINED") return "danger" as const;
  if (status === "COMPLETED") return "neutral" as const;
  return "warn" as const;
}

export const REPORT_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
} as const;

export const REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Utkast",
  SUBMITTED: "Inskickad",
  APPROVED: "Godkänd",
  CHANGES_REQUESTED: "Kompletteras",
};

/** Färgton för rapportens status, så att alla listor märker den likadant. */
export function reportTone(status: string) {
  if (status === "APPROVED") return "ok" as const;
  if (status === "SUBMITTED") return "brand" as const;
  if (status === "CHANGES_REQUESTED") return "warn" as const;
  return "neutral" as const;
}

export const HIDE_OUTCOME_LABELS: Record<string, string> = {
  FOUND: "Markerad",
  MISSED: "Missad",
  FALSE_INDICATION: "Falsk markering",
};

export const INDICATION_OUTCOME_LABELS: Record<string, string> = {
  FIND: "Fynd",
  NO_FIND: "Utan fynd",
  FALSE_INDICATION: "Falsk markering",
};

export const PLAN_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Utkast",
  ACTIVE: "Aktiv",
  COMPLETED: "Avslutad",
  ARCHIVED: "Arkiverad",
};

export const EXERCISE_STATUS_LABELS: Record<string, string> = {
  PLANNED: "Att träna",
  COMPLETED: "Genomförd",
  SKIPPED: "Överhoppad",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  LATT: "Lätt",
  MEDEL: "Medel",
  SVAR: "Svår",
};

export const CERT_APPLIES_TO_LABELS: Record<string, string> = {
  DOG: "Hund",
  HANDLER: "Hundförare",
  TEAM: "Ekipage",
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  MISSION_ASSIGNED: "Nytt uppdrag",
  COMMENT: "Ny kommentar",
  TRAINING_PLANNED: "Planerad träning",
  CERT_EXPIRING: "Behörighet löper ut",
  FOLLOW_UP: "Uppföljning",
  SESSION_APPROVED: "Träning godkänd",
};

/** Vanliga val i formulären – fritext är fortfarande tillåtet. */
export const TRAINING_AREAS = [
  "Områdessök",
  "Fordonssök",
  "Byggnadssök",
  "Bagagesök",
  "Personsök",
  "Spårarbete",
  "Lydnad och förarbete",
];

export const SEARCH_ENVIRONMENTS = [
  "Skog",
  "Öppen mark",
  "Inomhus",
  "Lagerlokal",
  "Fordon",
  "Terminal",
  "Stadsmiljö",
];

export const TARGET_ODORS = [
  "Narkotika",
  "Sprängämnen",
  "Vapen och ammunition",
  "Människa",
  "Brandorsak",
];

export const MISSION_TYPES = [
  "Flygplatskontroll",
  "Evenemangssök",
  "Lagerkontroll",
  "Bostadssök",
  "Fordonskontroll",
  "Objektsbevakning",
  "Beredskap",
];

/**
 * Checklistan som föraren bockar av under uppdraget. Standardvärde – går
 * att ändra under Inställningar, som de andra listorna.
 */
export const MISSION_CHECKLIST = [
  "Säkerhetsgenomgång",
  "Utrustning kontrollerad",
  "Områdessök påbörjat",
  "Kommunikationskontroll",
  "Avslutande sök",
  "Rapport ifylld",
];

/** Händelser som registreras under pågående uppdrag. */
export const EVENT_KINDS = [
  "MARKING",
  "FIND",
  "DEVIATION",
  "NOTE",
  "OTHER",
] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export const EVENT_LABELS: Record<string, string> = {
  MARKING: "Markering",
  FIND: "Fynd",
  DEVIATION: "Avvikelse",
  NOTE: "Notering",
  OTHER: "Händelse",
};

/** Färgton per händelsetyp, så att listan går att läsa i en blick. */
export function eventTone(kind: string) {
  if (kind === "FIND") return "ok" as const;
  if (kind === "DEVIATION") return "danger" as const;
  if (kind === "MARKING") return "brand" as const;
  return "neutral" as const;
}

/** Antal dagar före utgång då ett certifikat räknas som "snart utgånget". */
export const CERT_WARNING_DAYS = 60;

/**
 * Perioderna i adminpanelens datumväljare. Ligger här och inte i panel.ts
 * eftersom väljaren är en klientkomponent – panel.ts är serveronly.
 */
export const PERIODER = {
  "30d": { label: "Senaste 30 dagarna", days: 30 },
  "3m": { label: "Senaste 3 månaderna", days: 92 },
  "12m": { label: "Senaste 12 månaderna", days: 365 },
} as const;

export type PeriodKey = keyof typeof PERIODER;

/**
 * Vilket certifikat en sökinriktning kräver för skarpt uppdrag. Nyckeln är
 * sökinriktningens kod, värdet certifikattypens kod.
 */
export const DISCIPLINE_CERT: Record<string, string> = {
  NARKOTIKA: "NARK_CERT",
  SPRANG: "SPRANG_CERT",
};

/** Certifikat som varje ekipage måste ha giltigt för att få tas ut. */
export const TEAM_REQUIRED_CERTS = ["NHPR", "EKIPAGE"];

/**
 * Vilka län som hör till varje region på kartan i adminpanelen.
 *
 * Det här är en antagen indelning, inte hämtad ur något system – stämmer
 * den inte med Avarns faktiska regioner rättas den här, och kartan följer
 * med när `npm run map` körs om. Regionsidan visar länen per region så att
 * ett fel syns i klartext och inte bara som en färg på kartan.
 */
export const REGION_LAN: Record<string, string[]> = {
  NORD: ["Norrbotten", "Västerbotten", "Jämtland", "Västernorrland"],
  MITT: [
    "Dalarna",
    "Gävleborg",
    "Värmland",
    "Örebro",
    "Västmanland",
    "Uppsala",
  ],
  OST: ["Stockholm", "Södermanland", "Östergötland", "Gotland"],
  VAST: ["Västra Götaland", "Halland", "Jönköping"],
  SYD: ["Skåne", "Blekinge", "Kronoberg", "Kalmar"],
};
